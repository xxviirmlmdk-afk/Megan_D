# Install PyInstaller
pip install pyinstaller

# Create a single-file executable
pyinstaller --onefile --windowed your_script.py

# Or with all dependencies bundled
pyinstaller --onefile --windowed --hidden-import=module_name your_script.py