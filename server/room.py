class Room:
    def __init__(self, max_users=None):
        self.users = set()
        self.max_users = max_users

    def add_user(self, websocket):
        if websocket in self.users:
            return False

        self.users.add(websocket)
        return True

    def remove_user(self, websocket):
        if websocket not in self.users:
            return False

        self.users.remove(websocket)
        return True

    def get_recipients(self, websocket):
        recipients = self.users.copy()
        if self.get_user_count() > 1:
            recipients.remove(websocket)
        return recipients

    def get_user_count(self):
        return len(self.users)

    def is_full(self):
        if self.max_users is None:
            return False

        return len(self.users) >= self.max_users

    def is_empty(self):
        return len(self.users) == 0
