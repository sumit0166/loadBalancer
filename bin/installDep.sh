echo " -- Installing Dependencies --"

required_packages=$(jq -r '.dependencies | keys | join(" ")' "./package.json")

for package in $required_packages; do
    echo "Checking package... $package"
    
    if ! npm list --depth=0 "$package" &> /dev/null; then
        echo "Package $package is not installed. Trying to install.."
        npm install "$package"
    fi
done