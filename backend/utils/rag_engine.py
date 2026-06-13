import os
import json
import numpy as np
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

VECTOR_STORE_PATH = Path(__file__).parent.parent / "knowledge/vector_store"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

LANGUAGE_INSTRUCTIONS = {
    "English": "Respond in clear, simple English.",
    "Hindi": "हिंदी में जवाब दें। सरल और स्पष्ट भाषा का प्रयोग करें।",
    "Marathi": "मराठीत उत्तर द्या. सोपी आणि स्पष्ट भाषा वापरा.",
    "Spanish": "Responde en español claro y sencillo."
}

LEVEL_INSTRUCTIONS = {
    "Beginner": "The user is completely new to soccer. Use very simple words. Avoid jargon. Use everyday analogies. Keep it short, 3 to 5 sentences max.",
    "Intermediate": "The user understands basic soccer rules. Use standard soccer terms but briefly explain tactical concepts. Keep it 5 to 7 sentences.",
    "Fan": "The user is a knowledgeable soccer fan. Use technical terms freely. Go deeper into tactics and nuance. Be detailed."
}

SYSTEM_PROMPT_TEMPLATE = """You are Cupify Coach, a friendly AI soccer companion for the FIFA World Cup 2026.
Your job is to help people understand soccer — rules, tactics, VAR decisions, player roles, and match moments.

{level_instruction}

{language_instruction}

Use ONLY the context provided below to answer the question. If the answer is not in the context, say you do not have enough information but offer a related explanation. Never make up facts. Be warm and enthusiastic about soccer.

Context from Knowledge Base:
{context}

Question: {question}

Answer:"""


class GraniteRAGEngine:

    def __init__(self):
        self.chunks = []
        self.embedder = None
        self.chunk_embeddings = None
        self.model = None
        self._load_components()

    def _load_components(self):
        # Load embedder
        print("Loading embedding model...")
        try:
            from sentence_transformers import SentenceTransformer
            self.embedder = SentenceTransformer(EMBEDDING_MODEL)
            print("Embedding model loaded")
        except Exception as e:
            print(f"Could not load embedder: {e}")
            self.embedder = None

        # Load knowledge base
        cache_file = VECTOR_STORE_PATH / "chunks.json"
        embeddings_file = VECTOR_STORE_PATH / "embeddings.npy"

        if cache_file.exists() and embeddings_file.exists():
            print("Loading knowledge base...")
            with open(cache_file, "r", encoding="utf-8") as f:
                self.chunks = json.load(f)
            self.chunk_embeddings = np.load(str(embeddings_file))
            print(f"Loaded {len(self.chunks)} chunks")
        else:
            print("Knowledge base not found. Run knowledge_pipeline.py first.")

        # Connect to IBM Granite
        api_key    = os.getenv("WATSONX_API_KEY", "").strip()
        project_id = os.getenv("WATSONX_PROJECT_ID", "").strip()
        url        = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com").strip()
        model_id   = os.getenv("WATSONX_MODEL", "ibm/granite-4-h-small").strip()

        if not api_key or not project_id:
            print("Watsonx credentials not set. Using fallback mode.")
            self.model = None
            return

        # Try new Credentials object style first (ibm_watsonx_ai >= 1.0)
        try:
            from ibm_watsonx_ai import Credentials
            from ibm_watsonx_ai.foundation_models import ModelInference
            from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams

            credentials = Credentials(url=url, api_key=api_key)

            self.model = ModelInference(
                model_id=model_id,
                credentials=credentials,
                project_id=project_id,
                params={
                    GenParams.MAX_NEW_TOKENS: 512,
                    GenParams.TEMPERATURE: 0.3,
                    GenParams.TOP_P: 0.9,
                    GenParams.REPETITION_PENALTY: 1.1
                }
            )
            # Quick test to confirm it works
            test = self.model.generate_text(prompt="Say hello in one word.")
            print(f"✅ IBM Granite connected! Model: {model_id}")
            print(f"   Test response: {test.strip()[:50]}")
            return

        except ImportError:
            print("Credentials class not found — trying legacy dict style...")
        except Exception as e:
            print(f"Credentials style failed: {e}")
            print("Trying legacy dict style...")

        # Fallback: legacy dict credentials style (ibm_watsonx_ai < 1.0)
        try:
            from ibm_watsonx_ai.foundation_models import ModelInference
            from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams

            self.model = ModelInference(
                model_id=model_id,
                credentials={"apikey": api_key, "url": url},
                project_id=project_id,
                params={
                    GenParams.MAX_NEW_TOKENS: 512,
                    GenParams.TEMPERATURE: 0.3,
                    GenParams.TOP_P: 0.9,
                    GenParams.REPETITION_PENALTY: 1.1
                }
            )
            test = self.model.generate_text(prompt="Say hello in one word.")
            print(f"✅ IBM Granite connected (legacy)! Model: {model_id}")
            print(f"   Test response: {test.strip()[:50]}")

        except Exception as e:
            print(f"❌ Granite not connected: {e}")
            self.model = None

    def retrieve_context(self, question, k=4):
        if not self.chunks or self.embedder is None or self.chunk_embeddings is None:
            return "", []

        q_emb  = self.embedder.encode([question])[0]
        scores = np.dot(self.chunk_embeddings, q_emb)
        top_k  = np.argsort(scores)[::-1][:k]

        context_parts = [self.chunks[i]["text"] for i in top_k]
        sources       = list(set([self.chunks[i]["source"] for i in top_k]))

        return "\n\n".join(context_parts), sources

    def generate_answer(self, question, level="Beginner", language="English"):
        context, sources = self.retrieve_context(question)

        if not context:
            context = "No specific context found. Answer from general soccer knowledge."

        prompt = SYSTEM_PROMPT_TEMPLATE.format(
            level_instruction  = LEVEL_INSTRUCTIONS.get(level, LEVEL_INSTRUCTIONS["Beginner"]),
            language_instruction = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["English"]),
            context  = context,
            question = question
        )

        if self.model:
            try:
                response = self.model.generate_text(prompt=prompt)
                answer   = response.strip()
                if not answer:
                    answer = self._fallback_answer(question, level, context)
            except Exception as e:
                print(f"Generation error: {e}")
                answer = self._fallback_answer(question, level, context)
        else:
            answer = self._fallback_answer(question, level, context)

        return {
            "answer":   answer,
            "sources":  sources,
            "level":    level,
            "language": language
        }

    def _fallback_answer(self, question, level, context):
        if not context or context.startswith("No specific"):
            return (
                "⚠️ Demo Mode: IBM Granite is not connected yet. "
                "Please check your WATSONX_API_KEY and WATSONX_PROJECT_ID in backend/.env\n\n"
                "Your question: " + question
            )

        lines   = [line.strip() for line in context.split('\n') if line.strip()]
        snippet = ' '.join(lines[:6])

        prefix = {
            "Beginner":     "Here is a simple explanation: ",
            "Intermediate": "Here is what you need to know: ",
            "Fan":          "Here is the detailed breakdown: "
        }.get(level, "")

        return "[Demo Mode - Granite not connected]\n\n" + prefix + snippet


_engine_instance = None

def get_engine():
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = GraniteRAGEngine()
    return _engine_instance

def reset_engine():
    global _engine_instance
    _engine_instance = None