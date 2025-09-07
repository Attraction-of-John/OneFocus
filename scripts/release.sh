#!/bin/bash

# 릴리즈 자동화 스크립트
VERSION=$1
if [ -z "$VERSION" ]; then
    echo "Usage: ./scripts/release.sh <version>"
    echo "Example: ./scripts/release.sh 1.0.0"
    exit 1
fi

echo "�� Starting automated release process for version $VERSION..."

# 1. 버전 업데이트
echo "📝 Updating versions..."
npm version $VERSION --no-git-tag-version

# 2. manifest.json 업데이트
echo "📝 Updating manifest.json..."
sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" public/manifest.json

# 3. CHANGELOG 업데이트
echo "�� Updating CHANGELOG..."
DATE=$(date +%Y-%m-%d)
TEMP_FILE=$(mktemp)
echo "## [Unreleased]" > $TEMP_FILE
echo "" >> $TEMP_FILE
echo "## [$VERSION] - $DATE" >> $TEMP_FILE
echo "" >> $TEMP_FILE
echo "### Added" >> $TEMP_FILE
echo "- New features and improvements" >> $TEMP_FILE
echo "" >> $TEMP_FILE
echo "### Changed" >> $TEMP_FILE
echo "- Bug fixes and optimizations" >> $TEMP_FILE
echo "" >> $TEMP_FILE
cat CHANGELOG.md >> $TEMP_FILE
mv $TEMP_FILE CHANGELOG.md

# 4. 빌드
echo "🔨 Building project..."
yarn build

# 5. Git 커밋 및 태그
echo "📦 Creating git tag..."
git add .
git commit -m "chore: release version $VERSION"
git tag -a "v$VERSION" -m "Release version $VERSION"

# 6. 푸시
echo "⬆️ Pushing to remote..."
git push origin main
git push origin "v$VERSION"

echo "✅ Automated release $VERSION completed!"
echo "📋 GitHub Actions will now:"
echo "   1. Create GitHub Release automatically"
echo "   2. Upload release assets"
echo "   3. Ready for Chrome Web Store upload"