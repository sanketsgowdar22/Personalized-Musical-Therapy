"""
music_seed.py – Seed the music catalog with 100+ therapeutically categorized tracks.

Usage:
    # From the project root:
    python database/seeds/music_seed.py

Each track includes valence (0-1), energy (0-1), genre, and BPM metadata drawn from
music therapy literature (ISO principle, Thayer model of mood).
"""

import asyncio
import os
import sys
from pathlib import Path

# Allow running from project root — must come before backend imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "backend"))

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402

# ---------------------------------------------------------------------------
# Track catalog: 100+ therapeutically mapped tracks
# Format: (name, artist, album, genre, valence, energy, bpm, mood_tags)
# ---------------------------------------------------------------------------
TRACK_CATALOG = [
    # ── Calm / Relaxation (Low valence, Low energy) ──────────────────────
    ("Weightless", "Marconi Union", "Weightless", "Ambient", 0.30, 0.10, 60, ["neutral", "fear", "sad"]),
    ("Clair de Lune", "Claude Debussy", "Suite Bergamasque", "Classical", 0.20, 0.05, 54, ["sad", "neutral"]),
    ("Nocturne Op.9 No.2", "Frédéric Chopin", "Nocturnes", "Classical", 0.25, 0.08, 66, ["sad", "neutral"]),
    ("Gymnopédie No.1", "Erik Satie", "Gymnopédies", "Classical", 0.22, 0.06, 76, ["sad", "neutral"]),
    ("River Flows in You", "Yiruma", "First Love", "New Age", 0.35, 0.12, 68, ["neutral", "sad"]),
    ("Experience", "Ludovico Einaudi", "In a Time Lapse", "Neoclassical", 0.30, 0.15, 74, ["neutral", "sad"]),
    ("Spiegel im Spiegel", "Arvo Pärt", "Tabula Rasa", "Classical", 0.18, 0.05, 55, ["sad", "fear"]),
    ("Comptine d'un autre été", "Yann Tiersen", "Amélie OST", "Neoclassical", 0.40, 0.18, 85, ["neutral", "sad"]),
    ("The Rain", "Ravi Shankar", "The Sounds of India", "World", 0.25, 0.12, 60, ["neutral", "sad"]),
    ("Nuvole Bianche", "Ludovico Einaudi", "Una Mattina", "Neoclassical", 0.28, 0.10, 58, ["sad", "neutral"]),
    # ── Sad / Validation (Low valence, Low-Medium energy) ─────────────────
    ("Someone Like You", "Adele", "21", "Pop", 0.18, 0.28, 67, ["sad"]),
    ("The Night We Met", "Lord Huron", "Strange Trails", "Indie Folk", 0.20, 0.25, 90, ["sad"]),
    ("Black", "Pearl Jam", "Ten", "Rock", 0.22, 0.35, 72, ["sad"]),
    ("Skinny Love", "Bon Iver", "For Emma, Forever Ago", "Indie Folk", 0.15, 0.20, 103, ["sad", "fear"]),
    ("The Sound of Silence", "Simon & Garfunkel", "Wednesday Morning", "Folk", 0.18, 0.22, 95, ["sad", "neutral"]),
    ("Hurt", "Nine Inch Nails", "The Downward Spiral", "Alternative", 0.12, 0.30, 70, ["sad", "disgust"]),
    ("Hallelujah", "Jeff Buckley", "Grace", "Folk Rock", 0.20, 0.25, 70, ["sad", "neutral"]),
    ("Fix You", "Coldplay", "X&Y", "Alternative Rock", 0.30, 0.25, 138, ["sad", "neutral"]),
    ("Breathe (2 AM)", "Anna Nalick", "Wreck of the Day", "Pop Rock", 0.25, 0.28, 90, ["sad", "neutral"]),
    ("Mad World", "Gary Jules", "Donnie Darko OST", "Alternative", 0.15, 0.18, 84, ["sad", "disgust"]),
    # ── Fear / Anxiety (Low valence, Medium energy) ───────────────────────
    ("Breathe", "Pink Floyd", "The Dark Side of the Moon", "Rock", 0.38, 0.30, 60, ["fear", "neutral"]),
    ("Fade to Black", "Metallica", "Ride the Lightning", "Metal", 0.20, 0.35, 108, ["fear", "sad"]),
    ("In the Air Tonight", "Phil Collins", "Face Value", "Pop Rock", 0.30, 0.32, 108, ["fear", "neutral"]),
    ("The Sound of Silence", "Disturbed", "Immortalized", "Metal", 0.18, 0.40, 95, ["fear", "angry"]),
    ("Teardrop", "Massive Attack", "Mezzanine", "Trip-Hop", 0.25, 0.28, 90, ["fear", "neutral"]),
    ("Where Is My Mind?", "Pixies", "Surfer Rosa", "Alternative", 0.30, 0.42, 128, ["fear", "surprise"]),
    ("Creep", "Radiohead", "Pablo Honey", "Alternative Rock", 0.22, 0.35, 92, ["sad", "fear"]),
    ("Strange Days", "The Doors", "Strange Days", "Psychedelic Rock", 0.28, 0.38, 92, ["fear", "neutral"]),
    ("The Unforgiven", "Metallica", "Metallica", "Heavy Metal", 0.20, 0.32, 70, ["sad", "fear"]),
    ("Thriller", "Michael Jackson", "Thriller", "Pop", 0.45, 0.60, 118, ["fear", "surprise"]),
    # ── Disgust / Processing (Low-Medium valence, Medium energy) ──────────
    ("Suite No. 1 in G Major", "J.S. Bach", "Cello Suites", "Classical", 0.30, 0.25, 65, ["disgust", "neutral"]),
    ("Passacaglia in C Minor", "Georg Friedrich Handel", "Various", "Classical", 0.22, 0.20, 60, ["disgust", "sad"]),
    ("Miles Davis - Kind of Blue", "Miles Davis", "Kind of Blue", "Jazz", 0.35, 0.28, 92, ["disgust", "neutral"]),
    ("Take Five", "Dave Brubeck Quartet", "Time Out", "Jazz", 0.42, 0.32, 174, ["neutral", "disgust"]),
    ("Strange Fruit", "Billie Holiday", "Strange Fruit", "Jazz", 0.10, 0.15, 60, ["disgust", "sad"]),
    ("Summertime", "Ella Fitzgerald", "Ella and Louis", "Jazz", 0.35, 0.22, 48, ["neutral", "disgust"]),
    ("God Bless the Child", "Billie Holiday", "Various", "Jazz", 0.20, 0.18, 70, ["sad", "disgust"]),
    ("Pavane for a Dead Princess", "Maurice Ravel", "Various", "Classical", 0.22, 0.15, 56, ["sad", "disgust"]),
    ("Adagio for Strings", "Samuel Barber", "Various", "Classical", 0.12, 0.18, 44, ["sad", "disgust"]),
    ("Lacrimosa", "Wolfgang Amadeus Mozart", "Requiem in D Minor", "Classical", 0.10, 0.22, 52, ["disgust", "sad"]),
    # ── Neutral / Grounding (Medium valence, Medium energy) ───────────────
    ("Yesterday", "The Beatles", "Help!", "Rock", 0.50, 0.38, 96, ["neutral", "sad"]),
    ("The Scientist", "Coldplay", "A Rush of Blood to the Head", "Alternative", 0.48, 0.35, 76, ["neutral", "sad"]),
    ("Iris", "Goo Goo Dolls", "Dizzy Up the Girl", "Rock", 0.50, 0.42, 82, ["neutral", "sad"]),
    ("Better Together", "Jack Johnson", "In Between Dreams", "Acoustic", 0.60, 0.42, 110, ["neutral", "happy"]),
    ("Ho Hey", "The Lumineers", "The Lumineers", "Indie Folk", 0.62, 0.52, 110, ["neutral", "happy"]),
    ("Banana Pancakes", "Jack Johnson", "In Between Dreams", "Acoustic", 0.65, 0.40, 96, ["neutral", "happy"]),
    ("Vanilla Twilight", "Owl City", "Ocean Eyes", "Electropop", 0.55, 0.38, 128, ["neutral", "sad"]),
    ("The Middle", "Jimmy Eat World", "Bleed American", "Alternative Rock", 0.60, 0.70, 162, ["neutral", "happy"]),
    ("Float On", "Modest Mouse", "Good News for People", "Indie Rock", 0.65, 0.68, 100, ["neutral", "happy"]),
    ("Clocks", "Coldplay", "A Rush of Blood to the Head", "Alternative", 0.52, 0.65, 130, ["neutral"]),
    # ── Uplifting / ISO Transition (Medium-High valence, Medium-High energy)
    ("Here Comes the Sun", "The Beatles", "Abbey Road", "Rock", 0.72, 0.60, 129, ["neutral", "happy"]),
    ("Lovely Day", "Bill Withers", "Menagerie", "Soul", 0.75, 0.58, 98, ["neutral", "happy"]),
    ("What a Wonderful World", "Louis Armstrong", "Various", "Jazz", 0.72, 0.30, 70, ["neutral", "happy"]),
    ("Three Little Birds", "Bob Marley", "Exodus", "Reggae", 0.80, 0.52, 102, ["neutral", "happy"]),
    ("Redemption Song", "Bob Marley", "Uprising", "Reggae", 0.68, 0.45, 100, ["neutral", "sad"]),
    (
        "Somewhere Over the Rainbow",
        "Israel Kamakawiwo'ole",
        "Facing Future",
        "Hawaiian",
        0.75,
        0.30,
        84,
        ["neutral", "happy"],
    ),
    ("Lean on Me", "Bill Withers", "Still Bill", "Soul", 0.72, 0.52, 76, ["neutral", "happy"]),
    ("You Are the Sunshine of My Life", "Stevie Wonder", "Talking Book", "Soul", 0.80, 0.60, 118, ["happy", "neutral"]),
    ("Isn't She Lovely", "Stevie Wonder", "Songs in the Key of Life", "Soul", 0.82, 0.65, 125, ["happy"]),
    ("Happy", "Pharrell Williams", "Girl", "Pop", 0.90, 0.80, 160, ["happy"]),
    # ── Happy / Joyful (High valence, High energy) ────────────────────────
    ("Walking on Sunshine", "Katrina & The Waves", "Walking on Sunshine", "Pop", 0.92, 0.90, 140, ["happy"]),
    ("Don't Stop Me Now", "Queen", "Jazz", "Rock", 0.88, 0.95, 156, ["happy"]),
    ("Uptown Funk", "Mark Ronson ft. Bruno Mars", "Uptown Special", "Funk", 0.90, 0.80, 115, ["happy"]),
    ("Can't Stop the Feeling!", "Justin Timberlake", "Trolls OST", "Pop", 0.90, 0.85, 113, ["happy"]),
    ("I Gotta Feeling", "The Black Eyed Peas", "The E.N.D.", "Pop", 0.88, 0.85, 128, ["happy"]),
    ("September", "Earth, Wind & Fire", "The Best of Earth Wind & Fire", "Funk", 0.90, 0.88, 126, ["happy"]),
    ("Dancing Queen", "ABBA", "Arrival", "Pop", 0.90, 0.85, 102, ["happy"]),
    ("Mr. Blue Sky", "Electric Light Orchestra", "Out of the Blue", "Pop Rock", 0.90, 0.80, 148, ["happy"]),
    ("Good as Hell", "Lizzo", "Coconut Oil", "Pop", 0.85, 0.80, 96, ["happy"]),
    ("Levitating", "Dua Lipa", "Future Nostalgia", "Pop", 0.88, 0.80, 103, ["happy"]),
    # ── Angry / High Energy (Low valence, High energy) ───────────────────
    ("Chop Suey!", "System of a Down", "Toxicity", "Metal", 0.30, 0.90, 142, ["angry"]),
    ("Break Stuff", "Limp Bizkit", "Significant Other", "Nu-Metal", 0.20, 0.95, 132, ["angry"]),
    ("Given Up", "Linkin Park", "Minutes to Midnight", "Alternative Metal", 0.25, 0.95, 148, ["angry"]),
    ("In the End", "Linkin Park", "Hybrid Theory", "Nu-Metal", 0.30, 0.80, 105, ["angry", "sad"]),
    ("Du Hast", "Rammstein", "Sehnsucht", "Industrial Metal", 0.22, 0.92, 110, ["angry"]),
    ("Back in Black", "AC/DC", "Back in Black", "Hard Rock", 0.42, 0.90, 92, ["angry"]),
    ("Enter Sandman", "Metallica", "Metallica", "Heavy Metal", 0.28, 0.88, 123, ["angry", "fear"]),
    (
        "You Oughta Know",
        "Alanis Morissette",
        "Jagged Little Pill",
        "Alternative Rock",
        0.25,
        0.80,
        138,
        ["angry", "disgust"],
    ),
    ("Killing Me Softly", "Fugees", "The Score", "Hip-Hop", 0.35, 0.60, 100, ["angry", "neutral"]),
    ("Rolling in the Deep", "Adele", "21", "Pop Soul", 0.35, 0.80, 105, ["angry", "sad"]),
    # ── Surprise / Energetic (Medium-High valence, High energy) ──────────
    ("Bohemian Rhapsody", "Queen", "A Night at the Opera", "Rock", 0.60, 0.70, 134, ["surprise", "neutral"]),
    ("Under Pressure", "Queen & David Bowie", "Hot Space", "Rock", 0.55, 0.72, 110, ["surprise", "neutral"]),
    ("Take On Me", "a-ha", "Hunting High and Low", "Synth-Pop", 0.72, 0.80, 169, ["surprise", "happy"]),
    ("Jump", "Van Halen", "1984", "Hard Rock", 0.78, 0.88, 128, ["surprise", "happy"]),
    ("Livin' on a Prayer", "Bon Jovi", "Slippery When Wet", "Rock", 0.72, 0.85, 123, ["surprise", "happy"]),
    ("Don't Stop Believin'", "Journey", "Escape", "Rock", 0.75, 0.80, 118, ["surprise", "happy"]),
    (
        "Total Eclipse of the Heart",
        "Bonnie Tyler",
        "Faster Than the Speed of Night",
        "Pop Rock",
        0.55,
        0.72,
        112,
        ["surprise", "sad"],
    ),
    ("Africa", "Toto", "Toto IV", "Pop Rock", 0.72, 0.68, 93, ["surprise", "neutral"]),
    ("Somebody That I Used to Know", "Gotye", "Making Mirrors", "Indie Pop", 0.42, 0.65, 129, ["surprise", "sad"]),
    ("Pumped Up Kicks", "Foster the People", "Torches", "Indie Pop", 0.60, 0.70, 128, ["surprise", "neutral"]),
    # ── Meditative / Mindfulness (Low-Medium valence, Low energy) ─────────
    ("Om Namah Shivaya", "Various", "Yoga Sessions", "World/Spiritual", 0.42, 0.10, 60, ["neutral", "fear"]),
    ("Gregorian Chant - Kyrie", "Monks of the Abbey", "Sacred Chant", "Choral", 0.35, 0.08, 52, ["neutral", "sad"]),
    ("Tibetan Singing Bowls", "Various", "Healing Sounds", "World", 0.40, 0.08, 55, ["neutral", "fear"]),
    ("Echoes", "Pink Floyd", "Meddle", "Progressive Rock", 0.40, 0.35, 68, ["neutral", "sad"]),
    (
        "The Great Gig in the Sky",
        "Pink Floyd",
        "The Dark Side of the Moon",
        "Progressive Rock",
        0.32,
        0.35,
        56,
        ["neutral", "sad"],
    ),
    ("Desert Rose", "Sting", "Brand New Day", "World Pop", 0.52, 0.48, 100, ["neutral"]),
    ("Return to Innocence", "Enigma", "MCMXC a.D.", "New Age", 0.50, 0.38, 100, ["neutral", "happy"]),
    ("Sadeness Part I", "Enigma", "MCMXC a.D.", "New Age", 0.35, 0.28, 60, ["neutral", "sad"]),
    ("Pure Shores", "All Saints", "Liquid State", "Pop", 0.60, 0.40, 95, ["neutral", "happy"]),
    ("On My Way", "Ben Harper", "Welcome to the Cruel World", "Acoustic", 0.60, 0.38, 92, ["neutral", "happy"]),
]


async def seed_tracks(db_url: str = None):
    """Insert all tracks into the database."""
    if db_url is None:
        db_url = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/ai_musical_therapy")

    # Ensure asyncpg driver
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    engine = create_async_engine(db_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    print(f"Connecting to: {db_url}")
    print(f"Seeding {len(TRACK_CATALOG)} tracks...")

    async with async_session() as session:
        from sqlalchemy import text

        # Upsert tracks into a simple music_tracks table
        # (Table must already exist via Alembic migration)
        for i, (name, artist, album, genre, valence, energy, bpm, mood_tags) in enumerate(TRACK_CATALOG, 1):
            await session.execute(
                text(
                    """
                    INSERT INTO music_tracks (name, artist, album, genre, valence, energy, bpm, mood_tags)
                    VALUES (:name, :artist, :album, :genre, :valence, :energy, :bpm, :mood_tags)
                    ON CONFLICT (name, artist) DO UPDATE
                    SET genre=EXCLUDED.genre, valence=EXCLUDED.valence,
                        energy=EXCLUDED.energy, bpm=EXCLUDED.bpm, mood_tags=EXCLUDED.mood_tags
                """
                ),
                {
                    "name": name,
                    "artist": artist,
                    "album": album,
                    "genre": genre,
                    "valence": valence,
                    "energy": energy,
                    "bpm": bpm,
                    "mood_tags": mood_tags,
                },
            )
            print(f"  [{i:03d}/{len(TRACK_CATALOG)}] {name} — {artist}")

        await session.commit()

    await engine.dispose()
    print(f"\n[SUCCESS] Seeded {len(TRACK_CATALOG)} tracks.")


if __name__ == "__main__":
    asyncio.run(seed_tracks())
