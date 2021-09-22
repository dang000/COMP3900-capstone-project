from app.courses.element import Element


class Clo(Element):
    def __init__(self, text: str):
        super().__init__(text)

    def __repr__(self) -> str:
        return f"<Clo {self.text=}>"

    def valid(self) -> bool:
        # Should this just be type(get_text()) == str?
        return isinstance(self, Clo) and isinstance(self.get_text(), str)
