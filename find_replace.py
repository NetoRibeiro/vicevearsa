import os

project_folder = os.getcwd()  # Get the current working directory as the project folder

print(f"Performing find and replace in project folder: {project_folder}")

replacements = {
    "department": "department",
    "Department": "Department",
    "DEPARTMENT": "DEPARTMENT"
}


def replace_in_file(filepath, replacements):
    """Reads a file, performs replacements, and writes back if content changed."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        modified_content = content
        for old_str, new_str in replacements.items():
            modified_content = modified_content.replace(old_str, new_str)
        
        if modified_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(modified_content)
            print(f"  Modified content in: {filepath}")
    except Exception as e:
        print(f"  Could not modify content of {filepath}: {e}")

# Walk through the directory tree, processing files and directories bottom-up
# This ensures that files are processed before their parent directories are renamed,
# and subdirectories are renamed before their parent directories.
for root, dirs, files in os.walk(project_folder, topdown=False):
    # 1. Process files (content and then name)
    for name in files:
        old_filepath = os.path.join(root, name)
        
        # Replace content within the file
        replace_in_file(old_filepath, replacements)

        # Prepare for file renaming
        new_name = name
        for old_str, new_str in replacements.items():
            new_name = new_name.replace(old_str, new_str)
        
        # Rename file if necessary
        if new_name != name:
            new_filepath = os.path.join(root, new_name)
            try:
                os.rename(old_filepath, new_filepath)
                print(f"  Renamed file: {old_filepath} -> {new_filepath}")
            except Exception as e:
                print(f"  Could not rename file {old_filepath}: {e}")

    # 2. Rename directories (after all their contents and child files/directories are processed)
    # Iterate through a copy of dirs to allow modification of the list without issues
    for i in range(len(dirs)):
        old_dirname = dirs[i]
        old_dirpath = os.path.join(root, old_dirname)
        
        new_dirname = old_dirname
        for old_str, new_str in replacements.items():
            new_dirname = new_dirname.replace(old_str, new_str)
        
        # Rename directory if necessary
        if new_dirname != old_dirname:
            new_dirpath = os.path.join(root, new_dirname)
            try:
                os.rename(old_dirpath, new_dirpath)
                print(f"  Renamed directory: {old_dirpath} -> {new_dirpath}")
                # Update the dirs list for the current os.walk iteration if topdown=True, 
                # but for topdown=False, it's mostly for logging/tracking consistency.
                dirs[i] = new_dirname
            except Exception as e:
                print(f"  Could not rename directory {old_dirpath}: {e}")

print("Find and replace operations completed.")