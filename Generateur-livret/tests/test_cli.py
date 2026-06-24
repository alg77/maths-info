import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]


class CommandLineTests(unittest.TestCase):
    def test_html_only_generation_does_not_require_weasyprint(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory)
            result = subprocess.run(
                [
                    sys.executable,
                    str(PROJECT_ROOT / "build_livret.py"),
                    str(PROJECT_ROOT / "examples" / "chapitre-composants.md"),
                    "--mode",
                    "both",
                    "--format",
                    "html",
                    "--out",
                    str(output),
                ],
                cwd=PROJECT_ROOT,
                capture_output=True,
                text=True,
                encoding="utf-8",
                check=False,
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            teacher = output / "chapitre-composants__prof_web.html"
            student = output / "chapitre-composants__eleve_web.html"
            self.assertTrue(teacher.is_file())
            self.assertTrue(student.is_file())
            self.assertIn('class="rep"', teacher.read_text(encoding="utf-8"))
            self.assertIn('class="blank"', student.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
