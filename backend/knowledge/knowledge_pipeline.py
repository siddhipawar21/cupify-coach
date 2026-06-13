import json
import numpy as np
from pathlib import Path
import sys

BASE_DIR   = Path(__file__).parent.parent
DATA_DIR   = BASE_DIR / "data"
VECTOR_DIR = Path(__file__).parent / "vector_store"
VECTOR_DIR.mkdir(exist_ok=True)

EMBEDDING_MODEL = "all-MiniLM-L6-v2"
CHUNK_SIZE      = 500
CHUNK_OVERLAP   = 80

print("=" * 50)
print("  Cupify Coach Knowledge Pipeline")
print("=" * 50)

BUILTIN_KNOWLEDGE = [
    {"source":"FIFA Laws","text":"Law 1 - The Field of Play: The field must be rectangular. Touch lines are longer boundary lines, goal lines are shorter. For international matches length 100-110m, width 64-75m."},
    {"source":"FIFA Laws","text":"Law 2 - The Ball: Spherical, circumference 68-70cm, weight 410-450g. Pressure 0.6-1.1 atmosphere. Replaced if defective during play."},
    {"source":"FIFA Laws","text":"Law 3 - The Players: Two teams of 11 players including goalkeepers. Minimum 7 players to continue. Up to 5 substitutions per team in official matches, 6 in extra time."},
    {"source":"FIFA Laws","text":"Law 4 - Players Equipment: Jersey, shorts, socks, shinguards, footwear required. Goalkeeper wears different colors. No jewelry or dangerous equipment. Undershirts must match sleeve color."},
    {"source":"FIFA Laws","text":"Law 5 - The Referee: Enforces Laws of the Game. Decisions are final. Awards free kicks and penalty kicks. Shows yellow and red cards. Keeps time and records match events."},
    {"source":"FIFA Laws","text":"Law 6 - Other Match Officials: Assistant referees with flags signal offside, ball out of play, which team gets throw-ins or corners. Fourth official manages substitutions and technical area."},
    {"source":"FIFA Laws","text":"Law 7 - Duration: Two 45-minute halves. Half-time max 15 minutes. Stoppage time added for injuries, substitutions, VAR, celebrations. Extra time is two 15-minute periods. Penalty shootout if still level."},
    {"source":"FIFA Laws","text":"Law 8 - Kickoff: Taken at center spot to start match and after goals. Ball must move forward. All players in own half. Opponents minimum 9.15m from ball. Cannot score directly from kickoff."},
    {"source":"FIFA Laws","text":"Law 9 - Ball In and Out of Play: Out when whole ball crosses touchline or goal line on ground or in air. In play at all other times including rebounds off posts, crossbar or officials."},
    {"source":"FIFA Laws","text":"Law 10 - Determining the Outcome: Goal scored when whole ball passes over goal line between posts and under crossbar. Team scoring more goals wins. Equal goals means draw or extra time depending on competition."},
    {"source":"FIFA Laws","text":"Law 11 - Offside: Player in offside position if any part of head, body or feet is in opponents half AND closer to goal line than both the ball and second-last opponent. Arms are NOT included. Being offside is not an offence unless active in play."},
    {"source":"FIFA Laws","text":"Law 11 - Offside continued: A player is active in play if interfering with play, interfering with opponent, or gaining advantage. No offside from goal kick, corner kick, or throw-in. VAR draws lines to check offside positions."},
    {"source":"FIFA Laws","text":"Law 12 - Fouls and Misconduct: Direct free kick for kicking, tripping, jumping at, charging, striking, pushing, holding an opponent, or deliberate handball. Indirect free kick for dangerous play, impeding without contact."},
    {"source":"FIFA Laws","text":"Law 12 - Cards: Yellow card for unsporting behaviour, dissent, persistent infringement, time wasting, entering or leaving without permission. Red card for serious foul play, violent conduct, biting, spitting, denying obvious goal with handball, offensive language. Two yellows equals red."},
    {"source":"FIFA Laws","text":"Law 13 - Free Kicks: Direct free kick can score directly. Indirect free kick must touch another player first. Opponents must be 9.15m away. Kick taken from where offence occurred. Ball must be stationary."},
    {"source":"FIFA Laws","text":"Law 14 - Penalty Kick: For direct free kick offence inside penalty area. Taken from penalty spot 11 metres from goal. Goalkeeper must stay on goal line until ball is kicked. All other players outside penalty area. Kicker cannot touch ball again until another player touches it."},
    {"source":"FIFA Laws","text":"Law 15 - Throw-In: When ball fully crosses touchline. Taken by opponent of player who last touched it. Both feet on or behind touchline. Ball thrown from behind and over head with both hands equally. Cannot score directly from throw-in."},
    {"source":"FIFA Laws","text":"Law 16 - Goal Kick: When ball fully crosses goal line last touched by attacker. Taken from anywhere in goal area by defending team. Opponents outside penalty area until ball in play. Can score directly from goal kick."},
    {"source":"FIFA Laws","text":"Law 17 - Corner Kick: When ball fully crosses goal line last touched by defender. Taken from corner arc nearest to where it crossed. Opponents minimum 9.15m away. Can score directly. Kicker cannot touch ball again until another player touches it."},
    {"source":"VAR Rules","text":"VAR - Video Assistant Referee Protocol: Reviews four match-changing situations only: goals including offside and fouls in build-up, penalty decisions, red card incidents, mistaken identity. Only clear and obvious errors corrected by VAR."},
    {"source":"VAR Rules","text":"VAR Process: Check means VAR reviews footage and advises referee if clear error. Review means referee goes to pitchside monitor to watch footage themselves. Referee always makes final decision. VAR cannot overrule referee subjective decisions."},
    {"source":"VAR Rules","text":"VAR Offside: Uses calibrated lines to check if any scoring body part is in offside position. Lines drawn at last moment ball played. Multiple lines checked simultaneously. Process takes 2-5 minutes typically."},
    {"source":"World Cup 2026","text":"FIFA World Cup 2026: Hosted jointly by USA, Canada and Mexico. 48 nations competing expanded from 32 teams. 104 matches total. 16 host cities including New York, Los Angeles, Dallas, Miami, Toronto, Vancouver, Mexico City, Guadalajara, Monterrey."},
    {"source":"World Cup 2026","text":"World Cup 2026 Format: 12 groups of 4 teams in group stage. Top 2 from each group plus 8 best third-placed teams advance to round of 32. Then round of 16, quarter-finals, semi-finals, third place play-off, and final."},
    {"source":"World Cup 2026","text":"World Cup 2026 Final: Played at MetLife Stadium in New Jersey, New York on July 19, 2026. Capacity 82,500. One of largest stadiums ever to host a World Cup final."},
    {"source":"Tactics","text":"4-3-3 Formation: 4 defenders, 3 midfielders, 3 forwards. Very attacking. Wide forwards stretch opposition defence. Central midfielder controls tempo. Used by Barcelona, Liverpool, Manchester City. Requires high pressing intensity from forwards."},
    {"source":"Tactics","text":"4-4-2 Formation: 4 defenders, 4 midfielders, 2 forwards. Classic balanced formation. Two strikers partner together. Wide midfielders provide width and track back. England used this historically. Good defensive solidity."},
    {"source":"Tactics","text":"5-3-2 or 3-5-2 Formation: Three central defenders with wingbacks who push forward. Gives defensive security while providing width. Used by Italy, Atletico Madrid. Wingbacks must have high fitness as they cover entire flank."},
    {"source":"Tactics","text":"Gegenpressing: Counter-pressing tactic of immediately chasing ball after losing possession. Jürgen Klopp made famous at Dortmund and Liverpool. Goal is to win ball back within 6 seconds in opponents half. Requires extremely high fitness."},
    {"source":"Tactics","text":"Tiki-taka: Possession-based philosophy using short quick passes and movement to maintain control. Associated with Spain national team 2008-2012 and Pep Guardiola's Barcelona. Relies on technical excellence and positional awareness."},
    {"source":"Tactics","text":"High Press: Pressing opponents high up the pitch when they have the ball. Forces mistakes in dangerous areas. Used by Klopp's Liverpool and Guardiola's City. Leaves space behind defensive line which opponents can exploit with fast forwards."},
    {"source":"Tactics","text":"Low Block or Parking the Bus: Defensive tactic of sitting deep with compact shape and defending in own half. Hard to break down but limits attacking threat. Teams with less quality use this against stronger opponents."},
    {"source":"Tactics","text":"False Nine: A centre-forward who drops deep to collect the ball rather than staying high. Creates confusion in opposition defence. Messi played false nine under Guardiola. Creates space for midfielders to run into."},
    {"source":"Player Roles","text":"Goalkeeper: Last line of defence. Can use hands in penalty area. Must wear different color from outfield players. Takes goal kicks. Organises defensive line. Modern goalkeepers expected to be comfortable with feet and play out from back."},
    {"source":"Player Roles","text":"Centre-back or Central Defender: Defensive role in central areas. Must be strong in the air for headers. Reads game and positions well. Marshals defensive line. Good passing increasingly important in modern game."},
    {"source":"Player Roles","text":"Full-back or Wing-back: Defensive players on left or right side. Traditional full-back defends wide areas. Modern full-backs push forward to provide width and crosses. Wing-backs in 3-5-2 cover entire flank."},
    {"source":"Player Roles","text":"Defensive Midfielder or Holding Midfielder: Sits in front of back four. Shields defence by winning tackles and interceptions. Distributes ball simply. Sometimes called number 6. Examples: Sergio Busquets, N'Golo Kante, Casemiro."},
    {"source":"Player Roles","text":"Central Midfielder or Box-to-Box: Covers entire pitch, contributes defensively and attacks. High energy role. Must have good stamina. Examples: Steven Gerrard, Frank Lampard who both scored goals from midfield."},
    {"source":"Player Roles","text":"Attacking Midfielder or Number 10: Creative player between midfield and attack. Creates chances with passes and dribbles. Takes free kicks often. Classic examples: Zidane, Ronaldinho, Ozil. Role evolved in modern football."},
    {"source":"Player Roles","text":"Winger: Wide attacking player. Takes on defenders one-on-one. Delivers crosses. Cuts inside to shoot. Right-footed winger on left side cuts in to shoot, called inverted winger. Examples: Robben, Mane, Salah."},
    {"source":"Player Roles","text":"Striker or Centre-forward: Main goal scorer. Holds up play with back to goal. Makes runs in behind defence. Must finish chances. Target man is tall physical striker. Poacher stays in box waiting for chances."},
]

chunks = [{"text": k["text"], "source": k["source"]} for k in BUILTIN_KNOWLEDGE]
print(f"Built-in knowledge: {len(chunks)} chunks")

# ── Try to read PDFs using PyPDF2 (fast, no AI models needed) ──
pdf_files = list(DATA_DIR.glob("*.pdf")) if DATA_DIR.exists() else []

if pdf_files:
    print(f"\nFound {len(pdf_files)} PDF(s) in data/ folder:")
    for p in pdf_files:
        print(f"  - {p.name} ({p.stat().st_size // 1024} KB)")

    print("\nProcessing PDFs with PyPDF2 (fast mode)...")

    try:
        import pypdf
        READER = "pypdf"
    except ImportError:
        try:
            import PyPDF2
            READER = "PyPDF2"
        except ImportError:
            READER = None

    if READER is None:
        print("  Installing pypdf...")
        import subprocess
        subprocess.run([sys.executable, "-m", "pip", "install", "pypdf", "--quiet"])
        import pypdf
        READER = "pypdf"

    for pdf_path in pdf_files:
        print(f"\n  Reading: {pdf_path.name}...")
        try:
            if READER == "pypdf":
                import pypdf as pdf_lib
                reader = pdf_lib.PdfReader(str(pdf_path))
            else:
                import PyPDF2 as pdf_lib
                reader = pdf_lib.PdfReader(str(pdf_path))

            full_text = ""
            total_pages = len(reader.pages)
            print(f"  Total pages: {total_pages}")

            for i, page in enumerate(reader.pages):
                try:
                    text = page.extract_text()
                    if text:
                        full_text += text + "\n"
                except:
                    continue

                # Progress every 50 pages
                if (i+1) % 50 == 0:
                    print(f"  Processed {i+1}/{total_pages} pages...")

            words = full_text.split()
            print(f"  Extracted {len(words):,} words")

            if len(words) < 100:
                print(f"  Warning: very little text extracted, skipping")
                continue

            # Chunk it
            doc_chunks = 0
            i = 0
            while i < len(words):
                chunk_words = words[i:i + CHUNK_SIZE]
                chunk_text = ' '.join(chunk_words).strip()
                if len(chunk_text) > 80:
                    chunks.append({
                        "text": chunk_text,
                        "source": pdf_path.stem
                    })
                    doc_chunks += 1
                i += (CHUNK_SIZE - CHUNK_OVERLAP)

            print(f"  Created {doc_chunks} chunks from {pdf_path.name} ✅")

        except Exception as e:
            print(f"  Error: {e}")
            print(f"  Skipping {pdf_path.name}")
else:
    print(f"\nNo PDFs found in: {DATA_DIR}")
    print("Using built-in knowledge only.")

# ── Embeddings ─────────────────────────────────────────────────
print(f"\nTotal chunks: {len(chunks)}")
print(f"Loading embedding model: {EMBEDDING_MODEL}")

from sentence_transformers import SentenceTransformer
embedder = SentenceTransformer(EMBEDDING_MODEL)
texts = [c["text"] for c in chunks]
print("Creating embeddings...")
embeddings = embedder.encode(texts, show_progress_bar=True, batch_size=32)

# ── Save ───────────────────────────────────────────────────────
with open(VECTOR_DIR / "chunks.json", "w", encoding="utf-8") as f:
    json.dump(chunks, f, ensure_ascii=False, indent=2)
np.save(str(VECTOR_DIR / "embeddings.npy"), embeddings)

print(f"\nKnowledge base saved to {VECTOR_DIR}")
print(f"  chunks.json    : {len(chunks)} entries")
print(f"  embeddings.npy : shape {embeddings.shape}")

sources = {}
for c in chunks:
    sources[c["source"]] = sources.get(c["source"], 0) + 1
print(f"\nSources indexed:")
for s, count in sorted(sources.items()):
    print(f"  {s}: {count} chunks")

print("\nPipeline complete! Knowledge base is ready.")
print("Next: Run python app.py to start the server.")