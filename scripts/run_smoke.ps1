$py = if (Test-Path .venv/bin/python) { '.venv/bin/python' } else { 'python' }
& $py "src\osint_mapper_main.py"
