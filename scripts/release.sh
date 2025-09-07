#!/bin/bash

# 릴리즈 스크립트
VERSION=$1
if [ -z "$VERSION" ]; then
    echo "Usage: ./scripts/release.sh <version>"
    echo "Example: ./scripts/release.sh 1.0.0"
    exit 1
fi

echo "🚀 Starting release process for version $VERSION..."

# 1. 버전 업데이트
echo "📝 Updating versions..."
npm version $VERSION --no-git-tag-version

# 2. manifest.json 업데이트
sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" public/manifest.json

# 3. 빌드
echo "🔨 Building project..."
yarn build

# 4. Git 커밋 및 태그
echo "📦 Creating git tag..."
git add .
git commit -m "Release version $VERSION"
git tag -a "v$VERSION" -m "Release version $VERSION"

# 5. 푸시
echo "⬆️ Pushing to remote..."
git push origin main
git push origin "v$VERSION"

echo "✅ Release $VERSION completed!"
echo "📋 Next steps:"
echo "   1. Create GitHub Release"
echo "   2. Upload dist/ folder to Chrome Web Store"