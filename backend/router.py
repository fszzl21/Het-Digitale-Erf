import re

class Router:
    def __init__(self):
        self.routes = []

    def add(self, method, path_pattern, handler):
        """
        Register a route.
        path_pattern: Regex string for the path.
        handler: Function taking (request_handler, *groups)
        """
        # Ensure regex matches the full path
        if not path_pattern.startswith('^'):
            path_pattern = '^' + path_pattern
        if not path_pattern.endswith('$'):
            path_pattern = path_pattern + '$'
            
        print(f"Registering route: {method} {path_pattern}")
        self.routes.append((method, re.compile(path_pattern), handler))

    def match(self, method, path):
        """
        Finds a matching handler.
        Returns: (handler, groups) or (None, None)
        """
        for route_method, pattern, handler in self.routes:
            if route_method == method:
                match = pattern.match(path)
                if match:
                    return handler, match.groups()
        return None, None

# Singleton instance
router = Router()
