# DESIGN

Vercel·Linear 계열의 절제된 시스템에 한국어 안내 문서의 가독성 요구를 더한 디자인 시스템입니다. "차갑고 사무적이지만 인쇄·시니어 사용자도 다 읽을 수 있는" 톤이 목표입니다.

직접 모방은 안 합니다. Geist 글꼴, 순흑 배경, 그라디언트 텍스트 같은 카테고리 반사는 피합니다. 가져오는 것은 *원칙* 입니다 — 강한 타이포그래피 위계, 절제된 컬러, 넓은 여백, 미세한 1px 보더, 모노 폰트의 신호적 사용.

## Foundations

### Color (OKLCH, light only)

순흑·순백을 쓰지 않습니다. 모든 중성색은 같은 색상값(255, 푸른빛 미세 틴트)으로 끌어 일관된 종이 느낌을 만듭니다.

```css
:root {
  /* Surfaces */
  --bg:            oklch(98.7% 0.002 255);  /* 페이지 배경, 살짝 푸른 오프화이트 */
  --surface:       oklch(100%  0    0);     /* 카드/섹션 표면 */
  --surface-2:     oklch(96.5% 0.003 255);  /* 보조 표면 (입력 배경, soft card) */
  --surface-hover: oklch(95%   0.004 255);

  /* Borders */
  --border:        oklch(92%   0.004 255);  /* 기본 1px 보더, 매우 옅음 */
  --border-strong: oklch(83%   0.006 255);  /* 호버/포커스, 구분이 필요한 곳 */

  /* Text */
  --text:          oklch(18%   0.012 255);  /* 본문, 거의 흑색이지만 푸른 틴트 */
  --text-secondary:oklch(42%   0.012 255);  /* 부제, 라벨 */
  --text-muted:    oklch(56%   0.010 255);  /* meta, 캡션 */

  /* Accents (절제된 사용 — 아래 규칙 참조) */
  --accent:        oklch(22%   0.020 255);  /* primary 액션 배경 */
  --accent-hover:  oklch(30%   0.020 255);
  --accent-fg:     oklch(98.7% 0.002 255);
  --brand:         oklch(38%   0.090 250);  /* 학교 네이비 — 링크, 키커, 포커스 링 */
  --school:        oklch(56%   0.080 145);  /* 학교 그린 — 한 페이지 한 군데 */

  /* States */
  --danger:        oklch(58%   0.180  25);  /* 경고 (warn-box 등) */
  --success:       oklch(58%   0.130 145);
  --ring:          oklch(38%   0.090 250 / 0.20);
}
```

### Color Strategy

이 사이트는 **Restrained**(절제) 전략입니다. 한 페이지에서 컬러 액센트는 다음 둘 중 하나만 강하게 등장합니다:

- `--brand` (네이비) — 페이지 키커, 인라인 링크, 포커스 링
- `--school` (그린) — 브랜드 배지 한 곳

두 액센트가 같은 화면에 동시에 등장하지 않습니다. 본문 면적의 **90% 이상은 무채색**(중성 회색·흰색)입니다.

`--accent`(near-black)는 primary 버튼·강조 텍스트에 쓰며, 액센트 색이 아니라 위계 색입니다. 면적 제한 없이 씁니다.

### Theme

**Light only.** [static/brand-config.js:37](static/brand-config.js#L37)의 `lightOnly: true` 유지. 학교/사무실 형광등, 인쇄, 시니어 가독성 — 다크모드를 안 만드는 게 결정입니다.

## Typography

### Fonts

웹폰트 2개를 명시적으로 로드합니다. 빌드 도구가 없는 환경이라 `@import`로 처리합니다.

| 역할 | 글꼴 | 출처 |
|---|---|---|
| 본문(한글·라틴) | **Pretendard Variable** | jsDelivr CDN |
| 모노 (숫자, 코드, 라벨) | **JetBrains Mono** | Google Fonts |

```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
```

이유:
- **Geist는 한글 비커버.** Pretendard가 Geist의 한국어 등가물입니다(낮은 x-height, 좁은 ducting, 변동축 굵기 100~900).
- **Geist Mono 대신 JetBrains Mono.** Geist Mono는 Google Fonts에 있지만 Pretendard와 함께 쓰면 시각적 균형이 더 무겁습니다. JetBrains Mono가 더 절제됨.

다른 웹폰트(Geist sans, Inter 등) 추가하지 않습니다.

### Stack

```css
--font-sans:
  "Pretendard Variable", Pretendard,
  -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
  "Noto Sans KR", system-ui, sans-serif;

--font-mono:
  "JetBrains Mono", ui-monospace, SFMono-Regular,
  "SF Mono", Menlo, Consolas, monospace;
```

### Scale

위계 단계 비율 1.25 이상. 굵기 콘트라스트로 강도를 더합니다.

| 토큰 | 크기 | line-height | 용도 |
|---|---|---|---|
| `--fs-xs` | 0.75rem (12px) | 1.4 | 라벨, 캡션, mono 신호 |
| `--fs-sm` | 0.875rem (14px) | 1.5 | meta, breadcrumb, footer |
| `--fs-base` | 1rem (16px) | 1.7 | 본문 (한국어는 line-height 여유) |
| `--fs-md` | 1.125rem (18px) | 1.65 | 강조 본문, 리드 |
| `--fs-lg` | 1.375rem (22px) | 1.4 | h4 |
| `--fs-xl` | 1.75rem (28px) | 1.3 | h3 |
| `--fs-2xl` | 2.25rem (36px) | 1.2 | h2 (섹션) |
| `--fs-3xl` | 2.75rem (44px) | 1.15 | h1 (일반 페이지) |
| `--fs-display` | 3.5rem (56px) | 1.05 | h1 (홈 hero) |

데스크톱 기준. 모바일은 `clamp()`로 자연스럽게 축소(아래 규칙 참조).

### Tracking & Weight

- 디스플레이(h1, hero): `letter-spacing: -0.035em; font-weight: 700;`
- 섹션 제목(h2): `letter-spacing: -0.02em; font-weight: 700;`
- 본문(p, li): `letter-spacing: -0.005em; font-weight: 400;`
- 모노: `letter-spacing: 0; font-weight: 500;`
- **이모지·픽토그램 글꼴 폴백 안 넣습니다.** Apple/Segoe Color Emoji 폴백 제거.

### Korean rules

- `word-break: keep-all` 유지(한국어 단어 단위 줄바꿈).
- 본문 line-height 1.7 (Vercel 기본 1.5보다 위). 한글 받침 시각적 무게 보정.
- 행 길이: 본문 영역 max-width **680px** (`64ch` 부근). 표·코드 영역은 더 넓게.

## Layout

### Container widths

| 토큰 | 폭 | 용도 |
|---|---|---|
| `--w-prose` | 680px | 본문 위주 페이지(가이드, 안내사항 상세) |
| `--w-content` | 880px | 표준 페이지 폭 |
| `--w-wide` | 1120px | 홈, 도구 그리드 |
| `--w-page` | 1280px | 사이트 헤더·풋터 정렬 기준 |

`.container`는 `--w-content` 기본. 페이지에서 `.container.wide` / `.container.prose`로 오버라이드.

### Spacing scale

8px 그리드. clamp로 반응형.

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  24px;
--space-6:  32px;
--space-7:  48px;
--space-8:  64px;
--space-9:  96px;
--space-10: 128px;
```

섹션간 수직 간격은 `clamp(48px, 8vw, 96px)`. 모바일에서 자연스럽게 좁아짐.

### Side padding

`clamp(20px, 5vw, 64px)`. 데스크톱은 64px의 여유 패딩, 모바일은 20px.

### Page background

`body`는 `--bg` 평면. **`body.alien-side-bg`의 alien.jpg 배경, 사이드 거터, 패널 그림자 모두 제거**합니다. 클래스는 후방 호환을 위해 남기고 효과를 비활성화합니다(공기 좋은 흰 페이지가 새 기본).

### Vertical rhythm

같은 padding을 모든 섹션에 적용하지 않습니다. 위계에 따라 다름:

- Hero: padding `clamp(64px, 10vw, 128px) 0`
- 일반 섹션: 위 마진 `clamp(48px, 8vw, 96px)`, 내부 padding 0 (테두리 없음)
- 카드형 섹션: 내부 padding `clamp(20px, 4vw, 32px)` + 1px 보더

## Components

### Headings

```css
h1 { font: 700 var(--fs-3xl)/1.15 var(--font-sans); letter-spacing: -0.035em; color: var(--text); }
h1.hero { font-size: var(--fs-display); }
h2 { font: 700 var(--fs-2xl)/1.2 var(--font-sans); letter-spacing: -0.02em; color: var(--text); }
h3 { font: 600 var(--fs-xl)/1.3 var(--font-sans); letter-spacing: -0.015em; color: var(--text); }
h4 { font: 600 var(--fs-lg)/1.4 var(--font-sans); color: var(--text); }
```

`h1`은 더 이상 강제 center 정렬이 아닙니다. 페이지에 따라 본문(left), 홈/랜딩(center) 분기.

`h2 + hr` 패턴 폐지. 시각 분리는 위 마진과 굵기 콘트라스트로 충분.

### Page kicker

작은 모노 라벨 — 섹션 위의 카테고리/위치 표시.

```css
.page-kicker {
  font: 500 var(--fs-xs)/1.4 var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--brand);
}
```

한국어 텍스트도 mono로 처리 — Pretendard가 mono fallback에 들어가서 한글은 sans처럼 보이지만 letter-spacing/uppercase가 톤을 만듭니다. (한국어가 길면 mono 클래스 빼고 `.page-kicker.kr` 변형 사용.)

### Buttons

평평한 모양, 1px 보더, 8px 라운딩. 그림자 없음(호버에만 미세).

| 변형 | 배경 | 텍스트 | 보더 |
|---|---|---|---|
| `.btn` | `--surface` | `--text` | `--border-strong` |
| `.btn.primary` | `--accent` | `--accent-fg` | `--accent` |
| `.btn.ghost` | transparent | `--text` | `--border` |
| `.btn.link` | transparent | `--brand` | none, underline |

높이 기본 `--h-control: 40px`, padding `0 16px`. radius `8px`. 트랜지션 `150ms ease`.

호버 효과: 배경 1단계 어둡게(또는 surface-hover), `translateY` 없음. Vercel은 호버 elevate를 잘 안 씁니다.

### `.btn-menu` (홈/안내 페이지의 큰 메뉴 버튼)

전체 폭, 좌측 정렬, 1px 보더만 있는 카드형 버튼.

```css
.btn-menu {
  display: flex; justify-content: space-between; align-items: center;
  width: 100%;
  padding: 20px 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text);
  font: 600 var(--fs-md)/1.4 var(--font-sans);
  text-align: left;
  transition: border-color 150ms ease, background 150ms ease;
}
.btn-menu::after {
  content: "→"; /* arrow as text */
  color: var(--text-muted);
  font: 400 var(--fs-md)/1 var(--font-mono);
  margin-left: 24px;
}
.btn-menu:hover {
  border-color: var(--border-strong);
  background: var(--surface-2);
}
```

회색 채움 버튼(`#6b7280`) 폐기. 카드 호버로 어포던스 표현.

### Chip / breadcrumb

```css
.chip {
  display: inline-flex; align-items: center;
  height: 28px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text-secondary);
  font: 500 var(--fs-sm)/1 var(--font-sans);
}
.chip:hover { border-color: var(--border-strong); color: var(--text); }
.chip.is-active { background: var(--text); color: var(--accent-fg); border-color: var(--text); }
```

### Cards

카드는 시각 위계가 정말 필요한 경우만. 같은 면적의 카드 그리드는 피합니다.

```css
.section { /* 본문 카드 — 보더 1px, 그림자 없음 */
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: clamp(20px, 4vw, 32px);
  background: var(--surface);
}
.card { /* 더 작은 보조 카드 */
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px 20px;
  background: var(--surface-2);
}
```

`.tool-card`, `.info-card`, `.callout`, `.hero-card` 모두 이 두 베이스 위에서 정의. 라운딩·padding은 같이 통일(12px). 대형 라운딩(20px+)은 hero에만.

`box-shadow`는 호버에만, `0 1px 2px oklch(0% 0 0 / 0.04), 0 4px 8px oklch(0% 0 0 / 0.04)`. 살짝.

### Forms

```css
input[type="text"], input[type="search"], select, textarea {
  height: var(--h-control);
  padding: 0 14px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  color: var(--text);
  font: 400 var(--fs-base)/1.4 var(--font-sans);
}
input:focus, select:focus, textarea:focus {
  outline: 2px solid var(--ring);
  outline-offset: 1px;
  border-color: var(--brand);
}
```

높이 통일(40px). 입력 배경은 surface(흰색), surface-2 아님.

### Numbers (mono signal)

숫자(가격, 단가, 시간, 일자)는 `.mono` 또는 `<code>` 태그로 감싸 모노폰트로 표시. tabular-nums 활성.

```css
.mono, code, kbd, samp, .nums {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}
```

가격표·단가 표는 모노로 처리하면 자릿수가 정렬되어 가독성이 크게 올라감.

### Hero (홈)

```html
<section class="hero hero-with-figure">
  <div class="hero-text">
    <p class="page-kicker">문막초 교직원 안내</p>
    <h1>자주 묻는 학교행정,<br>한 페이지에서 정리</h1>
    <p class="hero-lead">가이드, 안내사항, 서식, 실무 도구를 한 번에 찾습니다.</p>
  </div>
  <figure class="hero-figure">
    <img src="/static/alien.jpg" alt="고주무관 캐릭터" />
  </figure>
</section>
```

- kicker → 큰 헤드라인 → 1줄 lead. 추가 카피 금지.
- 데스크톱: 좌측 텍스트(60%), 우측 마스코트(40%, max 360px). 텍스트 vertical-center.
- 모바일(<720px): 단일 컬럼. 마스코트는 텍스트 위에 작게(max 200px) 배치.
- brand-badge-row, callout.hero-card 폐기 (장식적). 슬로건은 footer로 이동.
- 마스코트는 홈 hero에서만 등장합니다. 다른 페이지에서는 사용하지 않습니다(PRODUCT.md anti-references 참조).

### Site header / footer

- 헤더: 페이지 폭 `--w-page`(1280px) 기준, 좌측 마스터 브랜드 텍스트 + 우측 미니멀 nav. 현재는 헤더가 없는 페이지가 많은데, 점진적으로 통일.
- 풋터: 회색 텍스트 1~2줄. 운영자 표기, 신뢰 메시지(`trustMessage`), 학교명. 슬로건은 풋터 한 곳에만 등장.

## Motion

- 트랜지션 표준: `150ms ease` (Vercel은 보통 150). 이전 사이트는 180.
- 호버: 색·보더 변화 위주. transform 사용 자제(특히 `translateY(-1px)` — Vercel은 카드를 띄우지 않습니다).
- 레이아웃 속성(width/height/margin) 트랜지션 금지.
- 곡선: ease-out 표준. bounce/elastic/spring 금지.

## Print

기존 print 스타일 유지(`alien-side-bg` 효과 제거). 새 시스템에서는 보더가 옅으니 print 시 `--border`를 약간 더 진하게 오버라이드.

## Accessibility

- 본문 contrast: AAA(`--text` vs `--bg`).
- 보더 contrast는 의도적으로 낮음(시각 노이즈 감소). 인터랙티브 요소는 `--border-strong`으로 충분히 보이게.
- 모든 인터랙티브에 `:focus-visible` 정의: 2px outline + offset 1px, color `--ring`.
- `aria-current="location"` 활성 칩에 유지.
- 폰트 크기는 px가 아니라 rem — 사용자가 브라우저 글자 크기를 조정할 수 있음.

## Anti-patterns (이 프로젝트 한정)

전역 anti-pattern은 PRODUCT.md / SKILL.md 참조. 추가:

- **페이지별 `<style>` 블록에서 `:root` 토큰 재정의 금지.** [a-bite/index1.html](a-bite/index1.html), [guide/pre-establish-budget/index.html](guide/pre-establish-budget/index.html) 같은 곳의 `--bg`, `--text`, `--primary` 재정의를 글로벌 토큰 사용으로 마이그레이션.
- **`!important` 추가 금지.** 기존 항목도 점진적으로 specificity로 풀기.
- **유틸리티 클래스 추가 금지.** `local-h2`, `text-rose` 같은 단발성 클래스 더 안 만듭니다. 컴포넌트 단위로 이름 짓기.
- **그림자로 위계 만들기 금지.** 보더 + 색·여백으로. shadow는 호버 미세 변화만.
- **카드 그리드 남발.** 같은 모양의 카드 4개 이상 나열되면 다른 표현(리스트, 표, 본문) 검토.
- **`translateY(-1px)` 호버.** 모든 곳에서 제거.
- **이모지·픽토그램 글꼴.** 시스템 색 이모지 폴백을 글꼴 스택에서 제외.
- **그라디언트 텍스트, 글래스모피즘, 사이드 스트라이프 보더.** 사용 안 함.
