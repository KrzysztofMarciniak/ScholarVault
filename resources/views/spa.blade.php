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

<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css"
  crossorigin="anonymous"
  referrerpolicy="no-referrer"
/>
    <link rel="stylesheet" href="/css/style.css">
    <meta name="color-scheme" content="light dark">
</head>
<body>
    <header>
    <nav id="navbar"></nav>
    </header>

    <main id="app" class="container mx-auto px-4 md:px-8">
        <!-- SPA content will be injected here -->
    </main>

    <footer class="fixed bottom-0 left-0 right-0 text-center">
        <p>&copy; {{ date('Y') }} ScholarVault. All rights reserved.</p>
    </footer>
</body>
</html>
