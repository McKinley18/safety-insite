# TEST TERMS — NOT A LEGAL DOCUMENT

## Hostile-content fixture

Every line below is a payload that must reach the page as VISIBLE TEXT and never as behaviour.

<script>window.__s308_xss = true; document.title = "pwned";</script>

<img src=x onerror="window.__s308_xss = true">

<iframe src="https://example.invalid/attacker"></iframe>

<a href="javascript:window.__s308_xss=true">a link with a javascript: scheme</a>

<div onclick="window.__s308_xss = true">a div carrying an event handler</div>

[a markdown link with a javascript scheme](javascript:window.__s308_xss=true)

[a markdown link with a data scheme](data:text/html;base64,PHNjcmlwdD53aW5kb3cuX19zMzA4X3hzcz10cnVlPC9zY3JpcHQ+)

<svg/onload="window.__s308_xss=true"></svg>

Ordinary text after the payloads, so a test can prove the renderer did not simply stop.
