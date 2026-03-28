import json
import os


def update_package(package_file):
        
    if not os.path.exists(package_file):
        print(f"Error: package.json not found at {package_file}")
    else:
        try:
            # Read the package.json file
            with open(package_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            current_version = data.get('version')

            if current_version:
                print(f"Current version: {current_version}")

                # Split the version string (e.g., "1.1.0" -> ["1", "1", "0"])
                version_parts = current_version.split('.')

                if len(version_parts) == 3 and all(part.isdigit() for part in version_parts):
                    major = int(version_parts[0])
                    minor = int(version_parts[1])
                    patch = int(version_parts[2])

                    # Increment patch version
                    patch += 1

                    # Handle patch version rollover
                    if patch > 9:
                        patch = 0
                        minor += 1

                        # Handle minor version rollover
                        if minor > 9:
                            minor = 0
                            major += 1

                    new_version = f"{major}.{minor}.{patch}"
                    data['version'] = new_version

                    # Write the updated package.json back
                    with open(package_file, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=2) # Use indent for pretty-printing

                    print(f"Updated version: {new_version}")
                else:
                    print(f"Warning: Version format '{current_version}' not in X.Y.Z format. Skipping increment.")
            else:
                print("Error: 'version' field not found in package.json")

        except json.JSONDecodeError:
            print(f"Error: Could not decode JSON from {package_file}. Is it a valid JSON file?")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            
project_folder = os.getcwd()
# Ensure package_file is defined, if not, set a default (though it should be from previous cells)
package_file = f'{project_folder}/package.json' # Default path if not set
package_template = f'{project_folder}/templates/_vicevearsa/.vicevearsa-version

list_files = [package_file, package_template]

for file_in in list_files:
    update_package(file_in)