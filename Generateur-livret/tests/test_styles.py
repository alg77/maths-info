import unittest

from livret import design_tokens, load_style


class StyleTests(unittest.TestCase):
    def test_official_palette_is_available_to_all_renderers(self):
        css = design_tokens()
        self.assertIn("--ink: #4a4458", css)
        self.assertIn("--accent-rose: #c06a8e", css)
        self.assertIn("--remember-background: #f3fbf6", css)
        self.assertIn("--challenge-border: #f3d79a", css)

    def test_missing_stylesheet_has_an_explicit_error(self):
        with self.assertRaisesRegex(FileNotFoundError, "Feuille de style introuvable"):
            load_style("absente.css")


if __name__ == "__main__":
    unittest.main()

