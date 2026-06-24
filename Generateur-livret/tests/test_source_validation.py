import tempfile
import unittest
from pathlib import Path

from livret import SourceError, load_source, validate_source


class SourceValidationTests(unittest.TestCase):
    def test_valid_source_returns_chapter_codes(self):
        source = (
            "# N1 | Nombres relatifs | 4e | Ca3\n\n"
            ":::prop | Propriété\n"
            "Une phrase.\n"
            ":::\n"
        )
        self.assertEqual(validate_source(source), ["N1"])

    def test_unknown_component_reports_its_line(self):
        source = "# N1 | Test | 4e |\n\n:::theoreme\nTexte\n:::\n"
        with self.assertRaisesRegex(SourceError, "composant inconnu 'theoreme'"):
            validate_source(source, "N1.txt")

    def test_unclosed_component_is_rejected(self):
        source = "# N1 | Test | 4e |\n\n:::prop\nTexte\n"
        with self.assertRaisesRegex(SourceError, "n'est pas fermé"):
            validate_source(source, "N1.txt")

    def test_malformed_header_is_rejected(self):
        with self.assertRaisesRegex(SourceError, "en-tête attendu"):
            validate_source("# N1 | Titre seulement\n", "N1.txt")

    def test_missing_include_names_parent_file_and_line(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            collection = root / "periode.txt"
            collection.write_text("@include absent.txt\n", encoding="utf-8")

            with self.assertRaises(SourceError) as context:
                load_source(collection)

        message = str(context.exception)
        self.assertIn("periode.txt:1", message)
        self.assertIn("absent.txt", message)

    def test_include_cycle_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            first = root / "premier.txt"
            second = root / "second.txt"
            first.write_text("@include second.txt\n", encoding="utf-8")
            second.write_text("@include premier.txt\n", encoding="utf-8")

            with self.assertRaisesRegex(SourceError, "inclusion circulaire"):
                load_source(first)


if __name__ == "__main__":
    unittest.main()

