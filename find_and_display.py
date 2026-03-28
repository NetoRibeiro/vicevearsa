import os

# Ensure project_folder is defined, if not, set a default
# This assumes project_folder was defined in a previous cell like 'project_folder = "/content/vicevearsa"'
# If it's not, you might need to adjust this or define it explicitly.
project_folder = os.getcwd()  # Get the current working directory as the project folder

print(f"Performing find and replace in project folder: {project_folder}")


def find_in_project(search_term, root_path, search_content=True, search_filename=True, case_sensitive=False):
    """
    Searches for a given term within file contents and/or filenames in a specified root path.

    Args:
        search_term (str): The word, phrase, or filename part to search for.
        root_path (str): The root directory to start the search from.
        search_content (bool): If True, search within file contents.
        search_filename (bool): If True, search within file and directory names.
        case_sensitive (bool): If True, the search is case-sensitive.
    """
    print(f"Searching for '{search_term}' in '{root_path}'...")
    found_results = []

    if not case_sensitive:
        search_term_lower = search_term.lower()

    for root, dirs, files in os.walk(root_path):
        # Search in directory names
        if search_filename:
            for d in dirs:
                check_name = d if case_sensitive else d.lower()
                if search_term_lower in check_name if not case_sensitive else search_term in check_name:
                    found_results.append(f"Directory Name: {os.path.join(root, d)}")

        # Search in file names and content
        for file_name in files:
            file_path = os.path.join(root, file_name)

            # Search in file names
            if search_filename:
                check_name = file_name if case_sensitive else file_name.lower()
                if search_term_lower in check_name if not case_sensitive else search_term in check_name:
                    found_results.append(f"File Name: {file_path}")

            # Search in file content
            if search_content:
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        for line_num, line in enumerate(f, 1):
                            check_line = line if case_sensitive else line.lower()
                            if search_term_lower in check_line if not case_sensitive else search_term in check_line:
                                found_results.append(f"File Content: {file_path} (Line {line_num}: {line.strip()})")
                                # Break after first match in file content to avoid duplicate results for the same file
                                break
                except Exception as e:
                    # print(f"  Could not read file {file_path}: {e}") # Uncomment for debugging file read errors
                    pass

    if found_results:
        print(f"\nFound {len(found_results)} occurrences:")
        for result in found_results:
            print(result)
    else:
        print("\nNo matches found.")


# --- How to use this function ---
# Define your search term
my_search_term = "Current customers"  # Change this to the word, phrase, or filename you're looking for

# Set search options:
# search_content=True will search inside file contents
# search_filename=True will search in file and directory names
# case_sensitive=False will ignore case during the search

find_in_project(
    search_term=my_search_term,
    root_path=project_folder,
    search_content=True,
    search_filename=False,
    case_sensitive=False
)

# Example 2: Search only for a filename (e.g., '.git')
# find_in_project(
#     search_term=".git",
#     root_path=project_folder,
#     search_content=False,
#     search_filename=True
# )

# Example 3: Search for a specific phrase case-sensitively in content only
# find_in_project(
#     search_term="High Performance (Recommended)",
#     root_path=project_folder,
#     search_content=True,
#     search_filename=False,
#     case_sensitive=True
# )