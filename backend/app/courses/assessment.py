from app.courses.element import Element


class Assessment(Element):
    def __init__(self, text: str, weight: int):
        super().__init__(text)
        self.weight: int = weight

    def __repr__(self) -> str:
        return f"<Assessment {self.text=}, {self.weight=}>"

    def get_weight(self) -> int:
        return self.weight

    def valid(self) -> bool:
        return type(self.weight) == int and type(self.text) == str

    def matches(self, text: str, weight: int):
        if not super().matches(text):
            return False
        return self.weight == weight
