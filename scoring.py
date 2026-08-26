"""채점 로직 — 3점 척도(2/1/0), 20점 만점을 100점으로 환산."""

from __future__ import annotations

from dataclasses import dataclass, field

from content import DOMAIN_BY_KEY, DOMAINS, QUESTIONS, QUESTIONS_BY_DOMAIN

MAX_PER_QUESTION = 2
TOTAL_MAX = MAX_PER_QUESTION * len(QUESTIONS)  # 20점

GOOD, WATCH, CHECK = "양호", "주의", "점검 필요"

BAND_STYLE = {
    GOOD: {"color": "#2f9e6e", "emoji": "🟢", "range": "75점 이상"},
    WATCH: {"color": "#e0a417", "emoji": "🟡", "range": "45~74점"},
    CHECK: {"color": "#d95a4e", "emoji": "🔴", "range": "45점 미만"},
}


def band(percent: float) -> str:
    """백분율을 등급으로 변환한다. 75 이상 양호, 45~74 주의, 45 미만 점검 필요."""
    if percent >= 75:
        return GOOD
    if percent >= 45:
        return WATCH
    return CHECK


@dataclass
class DomainResult:
    key: str
    name: str
    icon: str
    color: str
    score: int
    max_score: int
    percent: float
    band: str


@dataclass
class Result:
    answers: dict[str, int]          # 문항 id -> 보기 index (0=2점, 1=1점, 2=0점)
    total_score: int
    total_max: int
    percent: float                   # 100점 환산 점수
    band: str
    domains: list[DomainResult] = field(default_factory=list)

    @property
    def domain_by_key(self) -> dict[str, DomainResult]:
        return {d.key: d for d in self.domains}

    def weakest_domains(self) -> list[DomainResult]:
        """가장 낮은 영역부터 정렬해서 돌려준다."""
        return sorted(self.domains, key=lambda d: (d.percent, d.name))

    def action_items(self, limit: int = 3) -> list[dict]:
        """점수가 낮은 문항의 실천 행동을 골라 준다 (0점 문항 우선)."""
        items = []
        for q in QUESTIONS:
            idx = self.answers[q["id"]]
            opt = q["options"][idx]
            if opt["action"]:
                items.append(
                    {
                        "question": q["title"],
                        "domain": DOMAIN_BY_KEY[q["domain"]]["name"],
                        "icon": DOMAIN_BY_KEY[q["domain"]]["icon"],
                        "choice": opt["label"],
                        "action": opt["action"],
                        "score": MAX_PER_QUESTION - idx,
                    }
                )
        items.sort(key=lambda it: it["score"])
        return items[:limit]


def score_of(option_index: int) -> int:
    """보기 순서를 점수로 바꾼다. 첫 보기가 2점, 마지막이 0점."""
    return MAX_PER_QUESTION - option_index


def evaluate(answers: dict[str, int]) -> Result:
    """문항별 응답(보기 index)을 받아 전체·영역별 결과를 계산한다."""
    missing = [q["id"] for q in QUESTIONS if q["id"] not in answers]
    if missing:
        raise ValueError(f"응답이 없는 문항: {', '.join(missing)}")

    total = sum(score_of(answers[q["id"]]) for q in QUESTIONS)
    percent = round(total / TOTAL_MAX * 100, 1)

    domains = []
    for meta in DOMAINS:
        qs = QUESTIONS_BY_DOMAIN[meta["key"]]
        d_score = sum(score_of(answers[q["id"]]) for q in qs)
        d_max = MAX_PER_QUESTION * len(qs)
        d_percent = round(d_score / d_max * 100, 1)
        domains.append(
            DomainResult(
                key=meta["key"],
                name=meta["name"],
                icon=meta["icon"],
                color=meta["color"],
                score=d_score,
                max_score=d_max,
                percent=d_percent,
                band=band(d_percent),
            )
        )

    return Result(
        answers=dict(answers),
        total_score=total,
        total_max=TOTAL_MAX,
        percent=percent,
        band=band(percent),
        domains=domains,
    )


# ------------------------------------------------------- 공유용 인코딩/디코딩

def encode(answers: dict[str, int]) -> str:
    """응답을 문항 순서대로 이어 붙인 숫자 문자열로 만든다. 예: '0121002110'"""
    return "".join(str(answers[q["id"]]) for q in QUESTIONS)


def decode(code: str) -> dict[str, int] | None:
    """공유 링크의 코드를 응답 딕셔너리로 되돌린다. 형식이 틀리면 None."""
    if not code or len(code) != len(QUESTIONS) or not code.isdigit():
        return None
    values = [int(ch) for ch in code]
    if any(v > MAX_PER_QUESTION for v in values):
        return None
    return {q["id"]: v for q, v in zip(QUESTIONS, values)}
