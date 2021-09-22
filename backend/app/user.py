from app.courses.course import Course


class User:
    def __init__(self, id_: int, username: str, password: str):
        self.__id: int = id_
        self.__username: str = username
        self.__password: str = password
        self.__logged_in: bool = False
        self.__course: Course = Course()

    def __repr__(self) -> str:
        return f"User: {self.__id=}, {self.__username=}"

    def logged_in(self):
        return self.__logged_in

    def login(self):
        if not self.__logged_in:
            self.__logged_in = True
            return True
        else:
            return False

    def logoff(self):
        if self.__logged_in:
            self.__logged_in = False
            return True
        else:
            return False

    def validate(self, password: str):
        return self.__password == password

    @property
    def id(self):
        return self.__id

    @property
    def username(self):
        return self.__username

    @property
    def course(self):
        return self.__course
