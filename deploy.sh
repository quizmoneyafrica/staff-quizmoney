#!/bin/bash

git pull origin dev

git pull origin quizmoney-v2

# Check if the .gitignore file exists
if [ ! -f .gitignore ]; then
  echo ".gitignore file does not exist, creating one."
  touch .gitignore
fi

# Check if the user has passed a text to add
if [ -z "$1" ]; then
  echo "Usage: $0 <text-to-add-to-gitignore>"
  exit 1
fi

# Text to add to .gitignore
TEXT_TO_ADD=$1


# Append the text to the .gitignore file
echo "$TEXT_TO_ADD" >> .gitignore
echo "Added '$TEXT_TO_ADD' to .gitignore."


# Add and commit the .gitignore file to git
git add .gitignore
git commit -m "chore: '$TEXT_TO_ADD' to .gitignore"

git push origin dev

git checkout quizmoney-v2
git merge dev
git pull origin quizmoney-v2
git push origin quizmoney-v2

git checkout dev
