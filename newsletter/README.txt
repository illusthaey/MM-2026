# JSON 데이터 렌더링형 뉴스레터 번들

## 폴더 구조
- `/newsletter/index.html` : 대문 페이지
- `/newsletter/detail/index.html` : 공용 상세 템플릿
- `/newsletter/newsletter-renderer.css` : 렌더러 전용 최소 CSS
- `/newsletter/scripts/newsletter-common.js` : 공용 렌더링 유틸
- `/newsletter/scripts/newsletter-index.js` : 대문 렌더러
- `/newsletter/scripts/newsletter-detail.js` : 상세 렌더러
- `/newsletter/data/newsletters.json` : 대문 데이터 + 기사 메타데이터
- `/newsletter/data/articles/*.json` : 기사 본문 데이터

## 배치 경로
이 번들은 사이트 루트 기준 `/newsletter` 폴더에 올리는 것을 전제로 작성했습니다.

예:
- `/newsletter/index.html`
- `/newsletter/detail/index.html`
- `/newsletter/data/newsletters.json`

다른 경로를 쓸 때는 `index.html`, `detail/index.html`의 `<body data-newsletter-root="/newsletter">` 값을 바꿔 주세요.

## 새 기사 추가 순서
1. `data/articles/새슬러그.json` 파일을 만든다.
2. `data/newsletters.json`의 `articles` 배열에 메타데이터를 추가한다.
3. `categoryId`를 기존 카테고리 ID 중 하나로 맞춘다.
4. 대문 페이지를 새로고침하면 자동 반영된다.

## 중요한 점
- 이 구조는 `fetch()`로 JSON을 읽습니다.
- 따라서 파일을 더블클릭해서 `file://`로 열면 동작하지 않을 수 있습니다.
- 로컬 테스트는 정적 서버로 여는 것이 안전합니다.
  - 예: `python -m http.server 8000`

## 슬러그 예시
- `/newsletter/detail/index.html?slug=pre-establish-budget`
- `/newsletter/detail/index.html?slug=education-expense-settlement`
