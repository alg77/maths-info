import tempfile
import unittest
from pathlib import Path

import build_livret


class StudentTeacherRenderingTests(unittest.TestCase):
    def test_teacher_mode_displays_answer(self):
        rendered = build_livret.process("Résultat : [[15]]", "prof")
        self.assertIn('<span class="rep">15</span>', rendered)

    def test_student_mode_replaces_answer_with_blank(self):
        rendered = build_livret.process("Résultat : [[15]]", "eleve")
        self.assertNotIn(">15<", rendered)
        self.assertIn('class="blank"', rendered)

    def test_interactive_mode_keeps_answer_separately(self):
        rendered = build_livret.process("Résultat : [[15]]", "inter")
        self.assertIn('<span class="ans">15</span>', rendered)


class ParserTests(unittest.TestCase):
    def test_component_is_parsed(self):
        blocks = build_livret.parse(
            "# N1 | Test | 4e | Ca3\n\n"
            ":::prop | Propriété\n"
            "Une phrase.\n"
            ":::\n"
        )
        self.assertEqual(blocks[0][0], "header")
        self.assertEqual(blocks[1], ("box", ("prop", "Propriété", ["Une phrase."])))

    def test_include_composes_sources_without_duplication(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "chapter.txt").write_text("# N1 | Test | 4e |\n", encoding="utf-8")
            collection = root / "collection.txt"
            collection.write_text(
                "@include chapter.txt\n@include chapter.txt\n", encoding="utf-8"
            )

            loaded = build_livret.load_source(collection)

        self.assertEqual(loaded.count("# N1 | Test | 4e |"), 1)


if __name__ == "__main__":
    unittest.main()

