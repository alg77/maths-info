import unittest

from livret import COMPONENT_LABELS, parse, render_body, validate_source


class ComponentRegistryTests(unittest.TestCase):
    def test_requested_components_are_registered(self):
        for component in (
            "definition",
            "propriete",
            "exemple",
            "methode",
            "exercice",
            "retenir",
            "defi",
            "ressources",
            "qr",
        ):
            self.assertIn(component, COMPONENT_LABELS)

    def test_new_component_uses_single_source_blanks(self):
        source = (
            "# N0 | Test | 4e |\n\n"
            ":::exemple\n"
            "Le double de 7 vaut [[14]].\n"
            ":::\n"
        )
        validate_source(source)
        body = parse(source)[1:]

        teacher = render_body(body, "prof")
        student = render_body(body, "eleve")

        self.assertIn("Exemple", teacher)
        self.assertIn('<span class="rep">14</span>', teacher)
        self.assertIn('class="blank"', student)
        self.assertNotIn(">14<", student)

    def test_qr_component_has_a_stable_html_structure(self):
        source = (
            "# N0 | Test | 4e |\n\n"
            ":::qr | https://example.org\n"
            "Voir la ressource.\n"
            ":::\n"
        )
        body = parse(source)[1:]
        rendered = render_body(body, "eleve")

        self.assertIn('class="box box-qr"', rendered)
        self.assertIn('class="qr-card"', rendered)
        self.assertIn("Voir la ressource.", rendered)


if __name__ == "__main__":
    unittest.main()

