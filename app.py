"""건강하게 사는 법 — 생활 습관 자가진단 (Streamlit)

최근 일주일의 수면·활동량·식사·화면 시간을 10문항으로 점검하고,
100점 환산 점수와 영역별 등급, 이번 주 실천 카드, 생활 가이드를 보여 준다.
결과는 링크 하나로 누구에게나 공유할 수 있다.
"""

from __future__ import annotations

import plotly.graph_objects as go
import streamlit as st

from content import (
    DISCLAIMER,
    DOMAINS,
    GUIDES,
    OVERALL_MESSAGES,
    BAND_MESSAGES,
    PERIOD,
    PRINCIPLES,
    QUESTIONS,
    QUESTIONS_BY_DOMAIN,
)
from scoring import BAND_STYLE, TOTAL_MAX, Result, decode, encode, evaluate, score_of

FONT_STACK = "Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif"

st.set_page_config(
    page_title="건강하게 사는 법 · 생활 습관 자가진단",
    page_icon="🌿",
    layout="wide",
    initial_sidebar_state="collapsed",
    menu_items={"about": "최근 일주일의 생활 습관을 10문항으로 점검하는 공개 자가진단 페이지."},
)


# ------------------------------------------------------------------ 스타일

def inject_css() -> None:
    """페이지 전역 스타일. 빈 줄이 있으면 마크다운이 블록을 끊어 CSS가 노출되므로 한 덩어리로 둔다."""
    css = """
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');
html, body, [class*="css"], .stMarkdown, .stRadio label { font-family: Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif; }
.block-container { padding-top: 2.2rem; max-width: 1080px; }
#MainMenu, footer { visibility: hidden; }
.hero { background: linear-gradient(135deg, #eaf6ef 0%, #e8f0fd 100%); border: 1px solid #dfeae3; border-radius: 20px; padding: 2.4rem 2.2rem; margin-bottom: 1.4rem; }
.hero h1 { font-size: 2.1rem; margin: 0 0 .6rem; line-height: 1.3; color: #16281f; }
.hero p { font-size: 1.02rem; color: #40584c; margin: 0; line-height: 1.7; }
.hero .tagline { display: inline-block; background: #ffffffcc; border: 1px solid #cfe3d6; color: #2f7d5c; font-size: .82rem; font-weight: 600; padding: .28rem .7rem; border-radius: 999px; margin-bottom: .9rem; }
.card { background: #fff; border: 1px solid #e6e9ee; border-radius: 16px; padding: 1.25rem 1.35rem; margin-bottom: .9rem; }
.card h3 { margin: 0 0 .35rem; font-size: 1.05rem; color: #1d2b25; }
.card p { margin: 0; color: #5a6672; font-size: .93rem; line-height: 1.65; }
.section-title { display: flex; align-items: baseline; gap: .55rem; margin: 1.6rem 0 .2rem; font-size: 1.28rem; font-weight: 700; color: #1d2b25; }
.section-title span.sub { font-size: .86rem; font-weight: 500; color: #7c8a94; }
.qtitle { font-weight: 650; font-size: 1rem; color: #22312a; }
.qhelp { font-size: .84rem; color: #8a959d; margin-top: .15rem; margin-bottom: .4rem; }
.scorebox { background: #fff; border: 1px solid #e6e9ee; border-radius: 20px; padding: 1.6rem 1.7rem; }
.scorebox .big { font-size: 3.6rem; font-weight: 800; line-height: 1; }
.scorebox .unit { font-size: 1.1rem; font-weight: 600; color: #8a959d; margin-left: .2rem; }
.scorebox .raw { color: #8a959d; font-size: .9rem; margin-top: .45rem; }
.badge { display: inline-block; padding: .3rem .85rem; border-radius: 999px; font-weight: 700; font-size: .92rem; color: #fff; margin-bottom: .8rem; }
.dcard { background: #fff; border: 1px solid #e6e9ee; border-radius: 16px; padding: 1.05rem 1.2rem; margin-bottom: .7rem; }
.dcard .top { display: flex; justify-content: space-between; align-items: baseline; }
.dcard .nm { font-weight: 700; font-size: 1rem; color: #22312a; }
.dcard .pc { font-weight: 800; font-size: 1.05rem; }
.dcard .bar { height: 8px; border-radius: 999px; background: #eef1f4; margin: .6rem 0 .55rem; }
.dcard .bar > div { height: 8px; border-radius: 999px; }
.dcard .msg { font-size: .9rem; color: #5a6672; line-height: 1.6; }
.dcard .tag { font-size: .78rem; font-weight: 700; padding: .1rem .5rem; border-radius: 6px; color: #fff; margin-left: .35rem; }
.todo { background: #fbfdfb; border: 1px solid #dfeae3; border-left: 4px solid #2f9e6e; border-radius: 12px; padding: .95rem 1.1rem; margin-bottom: .6rem; }
.todo .meta { font-size: .78rem; color: #7c8a94; margin-bottom: .2rem; }
.todo .act { font-size: .98rem; color: #22312a; font-weight: 600; line-height: 1.55; }
.tip { border-bottom: 1px solid #eef1f4; padding: .8rem 0; }
.tip:last-child { border-bottom: none; }
.tip b { display: block; font-size: .98rem; color: #22312a; margin-bottom: .2rem; }
.tip span { font-size: .9rem; color: #5a6672; line-height: 1.6; }
.note { font-size: .82rem; color: #93a0a8; line-height: 1.6; }
.stRadio [role="radiogroup"] { gap: .4rem .9rem; }
div[data-testid="stHorizontalBlock"] { align-items: stretch; }
"""
    st.markdown(f"<style>{css}</style>", unsafe_allow_html=True)


# ------------------------------------------------------------------ 상태

def go_to(view: str) -> None:
    st.session_state.view = view


def read_shared_code() -> None:
    """공유 링크(?a=코드)로 들어온 경우 결과 화면으로 바로 연다."""
    if st.session_state.get("shared_loaded"):
        return
    code = st.query_params.get("a")
    answers = decode(code) if code else None
    if answers:
        for qid, idx in answers.items():
            st.session_state[f"q_{qid}"] = idx
        st.session_state.view = "result"
        st.session_state.is_shared = True
    st.session_state.shared_loaded = True


def current_answers() -> dict[str, int]:
    return {
        q["id"]: st.session_state[f"q_{q['id']}"]
        for q in QUESTIONS
        if st.session_state.get(f"q_{q['id']}") is not None
    }


def reset_answers() -> None:
    for q in QUESTIONS:
        st.session_state[f"q_{q['id']}"] = None
    st.session_state.is_shared = False
    st.query_params.clear()
    go_to("form")


# ------------------------------------------------------------------ 차트

def radar_chart(result: Result) -> go.Figure:
    names = [f"{d.icon} {d.name}" for d in result.domains]
    values = [d.percent for d in result.domains]
    fig = go.Figure()
    fig.add_trace(
        go.Scatterpolar(
            r=[75] * len(names) + [75],
            theta=names + names[:1],
            mode="lines",
            line=dict(color="#2f9e6e", width=1, dash="dot"),
            name="양호 기준 75",
            hoverinfo="skip",
        )
    )
    fig.add_trace(
        go.Scatterpolar(
            r=values + values[:1],
            theta=names + names[:1],
            fill="toself",
            fillcolor="rgba(47,158,110,.18)",
            line=dict(color="#2f9e6e", width=2.5),
            marker=dict(size=7, color="#2f9e6e"),
            name="내 점수",
            hovertemplate="%{theta}<br>%{r:.0f}점<extra></extra>",
        )
    )
    fig.update_layout(
        polar=dict(
            radialaxis=dict(range=[0, 100], tickvals=[0, 45, 75, 100], tickfont=dict(size=11, color="#98a4ac")),
            angularaxis=dict(tickfont=dict(size=13, color="#3d4a52")),
            bgcolor="#fbfcfd",
        ),
        showlegend=False,
        margin=dict(l=60, r=60, t=30, b=30),
        height=340,
        paper_bgcolor="rgba(0,0,0,0)",
        font=dict(family=FONT_STACK),
    )
    return fig


def gauge_chart(result: Result) -> go.Figure:
    color = BAND_STYLE[result.band]["color"]
    fig = go.Figure(
        go.Indicator(
            mode="gauge+number",
            value=result.percent,
            number=dict(suffix="점", font=dict(size=40, color=color, family=FONT_STACK)),
            gauge=dict(
                axis=dict(range=[0, 100], tickvals=[0, 45, 75, 100], tickfont=dict(size=11, color="#98a4ac")),
                bar=dict(color=color, thickness=0.72),
                bgcolor="#eef1f4",
                borderwidth=0,
                steps=[
                    dict(range=[0, 45], color="#fdeceb"),
                    dict(range=[45, 75], color="#fdf5e3"),
                    dict(range=[75, 100], color="#e9f6ef"),
                ],
            ),
        )
    )
    fig.update_layout(
        height=230,
        margin=dict(l=25, r=25, t=15, b=0),
        paper_bgcolor="rgba(0,0,0,0)",
        font=dict(family=FONT_STACK),
    )
    return fig


# ------------------------------------------------------------------ 화면들

def render_hero() -> None:
    st.markdown(
        f"""
        <div class="hero">
          <div class="tagline">🌿 건강하게 사는 법 · 공개 자가진단</div>
          <h1>최근 일주일, 나는 어떻게 살았을까</h1>
          <p>수면 · 활동량 · 식사 · 화면 시간을 10문항으로 점검한다.
          2분이면 끝나고, 100점 환산 점수와 영역별 등급, 이번 주에 바꿀 것 하나를 받는다.
          가입도 저장도 없다. 결과는 링크로 누구에게나 공유할 수 있다.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_intro() -> None:
    render_hero()

    cols = st.columns(4)
    for col, d in zip(cols, DOMAINS):
        n = len(QUESTIONS_BY_DOMAIN[d["key"]])
        with col:
            st.markdown(
                f"""<div class="card"><h3>{d['icon']} {d['name']} · {n}문항</h3>
                <p>{d['summary']}</p></div>""",
                unsafe_allow_html=True,
            )

    left, right = st.columns([1.15, 1])
    with left:
        st.markdown('<div class="section-title">채점 방식</div>', unsafe_allow_html=True)
        st.markdown(
            f"""
            <div class="card">
            <p>
            · 모든 문항은 <b>{PERIOD}</b>를 기준으로 답한다.<br>
            · 각 문항은 3점 척도로 <b>2점 / 1점 / 0점</b>을 매긴다.<br>
            · 10문항 <b>{TOTAL_MAX}점 만점</b>을 <b>100점</b>으로 환산한다.<br>
            · 영역별로도 백분율을 내어 등급을 함께 본다.
            </p>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with right:
        st.markdown('<div class="section-title">등급 기준</div>', unsafe_allow_html=True)
        rows = "".join(
            f"""<div class="tip"><b>{BAND_STYLE[b]['emoji']} {b} · {BAND_STYLE[b]['range']}</b>
            <span>{OVERALL_MESSAGES[b].split('.')[0]}.</span></div>"""
            for b in ("양호", "주의", "점검 필요")
        )
        st.markdown(f'<div class="card">{rows}</div>', unsafe_allow_html=True)

    st.write("")
    st.button("진단 시작하기 →", type="primary", width="stretch", on_click=go_to, args=("form",))
    st.markdown(f'<p class="note">{DISCLAIMER}</p>', unsafe_allow_html=True)

    render_guide(expanded=False)


def render_form() -> None:
    st.markdown(
        f"""
        <div class="hero" style="padding:1.6rem 1.8rem;">
          <div class="tagline">🌿 10문항 · 약 2분</div>
          <h1 style="font-size:1.6rem;margin-bottom:.4rem;">{PERIOD}를 떠올리며 답해 주세요</h1>
          <p>정답은 없다. 실제와 가장 가까운 것을 고르는 편이 결과에 도움이 된다.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    answered = len(current_answers())
    st.progress(answered / len(QUESTIONS), text=f"{answered} / {len(QUESTIONS)} 문항 응답")

    number = 0
    for d in DOMAINS:
        qs = QUESTIONS_BY_DOMAIN[d["key"]]
        st.markdown(
            f'<div class="section-title">{d["icon"]} {d["name"]}'
            f'<span class="sub">{d["summary"]}</span></div>',
            unsafe_allow_html=True,
        )
        for q in qs:
            number += 1
            with st.container(border=True):
                st.markdown(
                    f'<div class="qtitle">Q{number}. {q["title"]}</div>'
                    f'<div class="qhelp">{q["help"]}</div>',
                    unsafe_allow_html=True,
                )
                st.radio(
                    q["title"],
                    options=[0, 1, 2],
                    format_func=lambda i, q=q: f"{q['options'][i]['label']}  ({score_of(i)}점)",
                    key=f"q_{q['id']}",
                    index=None,
                    horizontal=True,
                    label_visibility="collapsed",
                )

    st.write("")
    done = len(current_answers()) == len(QUESTIONS)
    c1, c2 = st.columns([3, 1])
    with c1:
        st.button(
            "결과 보기" if done else f"남은 문항 {len(QUESTIONS) - len(current_answers())}개",
            type="primary",
            width="stretch",
            disabled=not done,
            on_click=go_to,
            args=("result",),
        )
    with c2:
        st.button("처음부터", width="stretch", on_click=reset_answers)


def render_result() -> None:
    answers = current_answers()
    if len(answers) < len(QUESTIONS):
        st.warning("응답이 완성되지 않았다. 진단 화면으로 돌아가 남은 문항을 채워 주세요.")
        st.button("진단하러 가기", type="primary", on_click=go_to, args=("form",))
        return

    result = evaluate(answers)
    code = encode(answers)
    st.query_params["a"] = code

    style = BAND_STYLE[result.band]

    if st.session_state.get("is_shared"):
        st.info("공유받은 결과를 보고 있다. 아래 **내 결과 진단하기**로 직접 해 볼 수 있다.")

    st.markdown('<div class="section-title">진단 결과<span class="sub">'
                f'{PERIOD} 기준</span></div>', unsafe_allow_html=True)

    left, right = st.columns([1, 1.25])
    with left:
        st.markdown(
            f"""
            <div class="scorebox">
              <div class="badge" style="background:{style['color']}">
                {style['emoji']} {result.band} · {style['range']}
              </div>
              <div><span class="big" style="color:{style['color']}">{result.percent:g}</span>
                   <span class="unit">/ 100점</span></div>
              <div class="raw">원점수 {result.total_score} / {result.total_max}점
                   · 10문항 3점 척도</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        st.plotly_chart(gauge_chart(result), width="stretch", config={"displayModeBar": False})
    with right:
        st.plotly_chart(radar_chart(result), width="stretch", config={"displayModeBar": False})

    st.markdown(f'<div class="card"><p>{OVERALL_MESSAGES[result.band]}</p></div>', unsafe_allow_html=True)

    # 영역별 결과
    st.markdown('<div class="section-title">영역별 점수<span class="sub">'
                '75 이상 양호 · 45~74 주의 · 45 미만 점검 필요</span></div>', unsafe_allow_html=True)
    cols = st.columns(2)
    for i, d in enumerate(result.domains):
        s = BAND_STYLE[d.band]
        with cols[i % 2]:
            st.markdown(
                f"""
                <div class="dcard">
                  <div class="top">
                    <span class="nm">{d.icon} {d.name}
                      <span class="tag" style="background:{s['color']}">{d.band}</span></span>
                    <span class="pc" style="color:{s['color']}">{d.percent:g}<span
                      style="font-size:.8rem;color:#98a4ac"> / 100</span></span>
                  </div>
                  <div class="bar"><div style="width:{d.percent}%;background:{s['color']}"></div></div>
                  <div class="msg">{BAND_MESSAGES[d.key][d.band]}
                    <span style="color:#98a4ac"> · 원점수 {d.score}/{d.max_score}</span></div>
                </div>
                """,
                unsafe_allow_html=True,
            )

    # 문항별 응답
    with st.expander("문항별 응답과 해설 보기"):
        for d in result.domains:
            st.markdown(f"**{d.icon} {d.name}**")
            for q in QUESTIONS_BY_DOMAIN[d.key]:
                idx = answers[q["id"]]
                opt = q["options"][idx]
                mark = ["🟢", "🟡", "🔴"][idx]
                st.markdown(
                    f'<div class="tip"><b>{mark} {q["title"]} — {opt["label"]} ({score_of(idx)}점)</b>'
                    f'<span>{opt["note"]}</span></div>',
                    unsafe_allow_html=True,
                )

    # 실천 카드
    todos = result.action_items()
    st.markdown('<div class="section-title">이번 주 실천 카드<span class="sub">'
                '점수가 가장 낮은 것부터, 한 번에 하나씩</span></div>', unsafe_allow_html=True)
    if todos:
        for t in todos:
            st.markdown(
                f"""<div class="todo">
                <div class="meta">{t['icon']} {t['domain']} · {t['question']} — {t['choice']}</div>
                <div class="act">{t['action']}</div></div>""",
                unsafe_allow_html=True,
            )
    else:
        st.markdown(
            '<div class="todo"><div class="act">모든 문항이 만점이다. '
            '새로 더할 것보다 지금의 리듬을 바쁜 주에도 지키는 것이 이번 주 과제다.</div></div>',
            unsafe_allow_html=True,
        )

    render_share(result, code)
    render_guide(expanded=True, focus=result.weakest_domains()[0].key)

    st.write("")
    c1, c2 = st.columns(2)
    with c1:
        st.button("다시 진단하기", width="stretch", on_click=go_to, args=("form",))
    with c2:
        st.button("내 결과 진단하기 (처음부터)", type="primary",
                  width="stretch", on_click=reset_answers)
    st.markdown(f'<p class="note">{DISCLAIMER}</p>', unsafe_allow_html=True)


def summary_text(result: Result) -> str:
    lines = [
        "🌿 건강하게 사는 법 — 생활 습관 자가진단 결과",
        f"총점 {result.percent:g}/100점 ({result.total_score}/{result.total_max}) · {result.band}",
        "",
    ]
    for d in result.domains:
        lines.append(f"{d.icon} {d.name} {d.percent:g}점 · {d.band}")
    todos = result.action_items()
    if todos:
        lines += ["", "이번 주 실천"]
        lines += [f"- {t['action']}" for t in todos]
    return "\n".join(lines)


def report_markdown(result: Result) -> str:
    md = [
        "# 건강하게 사는 법 — 생활 습관 자가진단 결과",
        "",
        f"- 기준: {PERIOD}",
        f"- 총점: **{result.percent:g} / 100점** (원점수 {result.total_score}/{result.total_max})",
        f"- 등급: **{result.band}** ({BAND_STYLE[result.band]['range']})",
        "",
        "## 영역별 점수",
        "",
        "| 영역 | 원점수 | 100점 환산 | 등급 |",
        "| --- | --- | --- | --- |",
    ]
    for d in result.domains:
        md.append(f"| {d.icon} {d.name} | {d.score}/{d.max_score} | {d.percent:g} | {d.band} |")
    md += ["", "## 문항별 응답", ""]
    for q in QUESTIONS:
        idx = result.answers[q["id"]]
        opt = q["options"][idx]
        md.append(f"- **{q['title']}** — {opt['label']} ({score_of(idx)}점) · {opt['note']}")
    todos = result.action_items()
    if todos:
        md += ["", "## 이번 주 실천 카드", ""]
        md += [f"- [ ] ({t['domain']}) {t['action']}" for t in todos]
    md += ["", "---", "", DISCLAIMER]
    return "\n".join(md)


def share_url(code: str) -> str | None:
    """현재 페이지 주소에 결과 코드를 붙여 공유용 전체 URL을 만든다."""
    try:
        raw = st.context.url
    except Exception:  # 테스트 환경 등 컨텍스트가 없을 때
        return None
    if not raw:
        return None
    return f"{raw.split('?')[0].rstrip('/')}/?a={code}"


def render_share(result: Result, code: str) -> None:
    st.markdown('<div class="section-title">결과 공유<span class="sub">'
                '개인정보는 저장되지 않는다 · 응답 10자리만 링크에 담긴다</span></div>',
                unsafe_allow_html=True)
    c1, c2 = st.columns([1.4, 1])
    with c1:
        st.markdown("**결과 요약 (복사해서 공유)**")
        st.code(summary_text(result), language=None)
    with c2:
        st.markdown("**공유 링크**")
        url = share_url(code)
        if url:
            st.code(url, language=None)
            st.caption(f"결과 코드 `{code}` 만 링크에 담긴다. 열면 바로 이 결과 화면이 나온다.")
        else:
            st.markdown(
                f"""<div class="card"><p>브라우저 주소창이 이미 이 결과의 링크로 바뀌어 있다.
                그대로 복사해 보내면 상대방도 같은 결과 화면을 본다.<br><br>
                결과 코드: <code>{code}</code></p></div>""",
                unsafe_allow_html=True,
            )
        st.download_button(
            "결과 리포트 내려받기 (.md)",
            data=report_markdown(result).encode("utf-8"),
            file_name=f"health-habits-{code}.md",
            mime="text/markdown",
            width="stretch",
        )


def render_guide(expanded: bool, focus: str | None = None) -> None:
    st.markdown('<div class="section-title">건강하게 사는 법<span class="sub">'
                '점수를 올리는 실제 방법</span></div>', unsafe_allow_html=True)
    with st.expander("영역별 생활 가이드 펼쳐 보기", expanded=expanded):
        ordered = sorted(DOMAINS, key=lambda d: 0 if d["key"] == focus else 1) if focus else list(DOMAINS)
        if focus:
            name = ordered[0]["name"]
            st.caption(f"이번 진단에서 가장 낮은 영역은 **{name}**이다. 그래서 맨 앞 탭에 두었다.")
        tabs = st.tabs([f"{d['icon']} {d['name']}" for d in ordered] + ["🧭 기본 원칙"])
        for tab, d in zip(tabs, ordered):
            with tab:
                for title, body in GUIDES[d["key"]]:
                    st.markdown(
                        f'<div class="tip"><b>{title}</b><span>{body}</span></div>',
                        unsafe_allow_html=True,
                    )
        with tabs[-1]:
            for title, body in PRINCIPLES:
                st.markdown(
                    f'<div class="tip"><b>{title}</b><span>{body}</span></div>',
                    unsafe_allow_html=True,
                )


# ------------------------------------------------------------------ 사이드바

def render_sidebar() -> None:
    with st.sidebar:
        st.markdown("### 🌿 건강하게 사는 법")
        st.caption("최근 일주일 생활 습관 자가진단")
        st.markdown(
            f"""
            **채점 방식**
            - 10문항 · 3점 척도 (2 / 1 / 0점)
            - {TOTAL_MAX}점 만점 → 100점 환산
            - 영역별 백분율로 등급 산출

            **등급**
            - 🟢 양호 75 이상
            - 🟡 주의 45~74
            - 🔴 점검 필요 45 미만
            """
        )
        st.divider()
        st.button("처음 화면으로", width="stretch", on_click=go_to, args=("intro",))
        st.button("응답 초기화", width="stretch", on_click=reset_answers)
        st.divider()
        st.caption(DISCLAIMER)


# ------------------------------------------------------------------ 진입점

def main() -> None:
    inject_css()
    for q in QUESTIONS:
        st.session_state.setdefault(f"q_{q['id']}", None)
    st.session_state.setdefault("view", "intro")
    read_shared_code()
    render_sidebar()

    view = st.session_state.view
    if view == "form":
        render_form()
    elif view == "result":
        render_result()
    else:
        render_intro()


main()
