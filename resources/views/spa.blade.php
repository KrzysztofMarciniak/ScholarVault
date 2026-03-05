<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>ScholarVault</title>

    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <!-- Axios -->
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>

    <!-- SPA JS -->
    <script type="module" src="/js/spa.js"></script>
    <link rel="stylesheet" href="/css/style.css">
    <meta name="color-scheme" content="light dark">
</head>
<body>
    <header>
    <nav id="navbar"></nav>
    </header>

    <main id="app">
        <!-- SPA content will be injected here -->
    </main>

    <footer>
        <p>&copy; {{ date('Y') }} ScholarVault. All rights reserved.</p>
    </footer>
</body>
</html>
