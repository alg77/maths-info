import unittest
from unittest.mock import patch
from pathlib import Path
import tempfile

from pypdf import PageObject, PdfWriter

from assemble import A4_H, A4_W, booklet_order, impose


class BookletOrderTests(unittest.TestCase):
    def test_four_page_booklet(self):
        self.assertEqual(booklet_order(4), (4, [(4, 1), (2, 3)]))

    def test_incomplete_booklet_is_padded(self):
        self.assertEqual(booklet_order(5), (8, [(8, 1), (2, 7), (6, 3), (4, 5)]))

    def test_every_page_appears_once_after_padding(self):
        total, pairs = booklet_order(10)
        pages = [page for pair in pairs for page in pair]
        self.assertEqual(total, 12)
        self.assertEqual(sorted(pages), list(range(1, 13)))

    def test_single_sheet_message_uses_singular(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "source.pdf"
            output = Path(directory) / "output.pdf"
            writer = PdfWriter()
            writer.add_page(PageObject.create_blank_page(width=A4_W, height=A4_H))
            writer.add_page(PageObject.create_blank_page(width=A4_W, height=A4_H))
            with source.open("wb") as stream:
                writer.write(stream)

            with patch("builtins.print") as mocked_print:
                impose(source, output)

        messages = " ".join(str(call.args[0]) for call in mocked_print.call_args_list)
        self.assertIn("1 feuille A3", messages)
        self.assertNotIn("1 feuilles A3", messages)


if __name__ == "__main__":
    unittest.main()
