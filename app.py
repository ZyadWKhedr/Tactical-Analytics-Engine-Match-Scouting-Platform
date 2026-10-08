"""
Tactical Analytics & Match Scouting Intelligence Platform
==========================================================
Interactive Web Application built with Streamlit & Plotly.
"""

import os
import json
import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

# -----------------------------------------------------------------------------
# App Configuration & Styling
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="Tactical Analytics Engine",
    page_icon="⚽",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Glassmorphism Dark CSS
st.markdown("""
<style>
    .main {
        background-color: #0e1117;
        color: #f0f2f6;
    }
    .stMetric {
        background: rgba(255, 255, 255, 0.05);
        padding: 15px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .tactical-card {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
    }
    .badge-strength {
        background-color: #1b5e20;
        color: #c8e6c9;
        padding: 4px 10px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.85em;
        display: inline-block;
        margin: 2px;
    }
    .badge-weakness {
        background-color: #b71c1c;
        color: #ffcdd2;
        padding: 4px 10px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.85em;
        display: inline-block;
        margin: 2px;
    }
    .badge-style {
        background-color: #0d47a1;
        color: #bbdefb;
        padding: 6px 14px;
        border-radius: 14px;
        font-weight: 700;
        font-size: 0.95em;
        display: inline-block;
    }
</style>
""", unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# Data Loaders (Cached)
# -----------------------------------------------------------------------------
@st.cache_data
def load_data():
    models_dir = "models"
    data = {}
    
    # Tables
    for name in [
        "team_playstyles", "zone_vulnerabilities", "team_swot", 
        "swot_metrics", "player_ratings", "team_ratings", 
        "team_strength", "entry_routes", "press_triggers"
    ]:
        fpath_parquet = os.path.join(models_dir, f"{name}.parquet")
        fpath_csv = os.path.join(models_dir, f"{name}.csv")
        if os.path.exists(fpath_parquet):
            data[name] = pd.read_parquet(fpath_parquet)
        elif os.path.exists(fpath_csv):
            data[name] = pd.read_csv(fpath_csv)
        else:
            data[name] = pd.DataFrame()
            
    # JSON Dossiers
    json_path = os.path.join(models_dir, "team_dossiers.json")
    if os.path.exists(json_path):
        with open(json_path, "r") as f:
            data["dossiers"] = json.load(f)
    else:
        data["dossiers"] = {}
        
    return data

data = load_data()

# -----------------------------------------------------------------------------
# Sidebar Navigation
# -----------------------------------------------------------------------------
st.sidebar.image("figures/xt_surface_heatmap.png", use_container_width=True)
st.sidebar.title("⚽ Tactical Intelligence")
st.sidebar.caption("SPADL-Based Football Match Analytics")

page = st.sidebar.radio(
    "Navigation Menu",
    [
        "🏟️ Executive Overview",
        "📋 Team Scouting Dossier",
        "⚔️ Matchup Simulator",
        "⭐ Player Ratings & Scouting",
        "🗺️ Expected Threat (xT) Visualizer",
        "📈 Validation & Reliability Suite"
    ]
)

# -----------------------------------------------------------------------------
# 1. Executive Overview
# -----------------------------------------------------------------------------
if page == "🏟️ Executive Overview":
    st.title("⚽ Tactical Analytics Intelligence Platform")
    st.markdown("""
    Welcome to the **Tactical Analytics Engine**, an end-to-end match intelligence and scouting platform.
    The system processes **2,462,726 spatial actions** across **1,941 matches** to derive team tactical DNA,
    zone vulnerabilities, playstyles, and contextual ratings.
    """)
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Matches", "1,941", "Full Database")
    with col2:
        st.metric("Actions Processed", "2.46M", "SPADL Format")
    with col3:
        st.metric("Teams Scouted", str(len(data.get("team_playstyles", []))), "142 Clubs")
    with col4:
        st.metric("Players Evaluated", str(len(data.get("player_ratings", []))), "3,031 Profiles")
        
    st.markdown("---")
    
    col_left, col_right = st.columns(2)
    with col_left:
        st.subheader("🎯 Playstyle & Archetype Clustering")
        if not data["team_playstyles"].empty:
            fig_cluster = px.scatter(
                data["team_playstyles"],
                x="possession_dominance",
                y="press_intensity",
                color="archetype_name" if "archetype_name" in data["team_playstyles"].columns else "playstyle",
                hover_data=["team_id", "matches", "playstyle"],
                labels={
                    "possession_dominance": "Possession Dominance (0-100)",
                    "press_intensity": "Press Intensity (0-100)"
                },
                template="plotly_dark",
                height=450
            )
            fig_cluster.add_hline(y=50, line_dash="dash", line_color="gray")
            fig_cluster.add_vline(x=50, line_dash="dash", line_color="gray")
            st.plotly_chart(fig_cluster, use_container_width=True)
            
    with col_right:
        st.subheader("🛡️ Global Defensive Zone Vulnerability")
        if not data["zone_vulnerabilities"].empty:
            zv = data["zone_vulnerabilities"].groupby(["channel", "band"])["vulnerability_index"].mean().reset_index()
            pivot = zv.pivot(index="channel", columns="band", values="vulnerability_index")
            fig_heat = px.imshow(
                pivot,
                labels=dict(x="Pitch Band (Defensive -> Attacking)", y="Pitch Channel (Left -> Right)", color="Vulnerability"),
                color_continuous_scale="YlOrRd",
                template="plotly_dark",
                height=450
            )
            st.plotly_chart(fig_heat, use_container_width=True)

# -----------------------------------------------------------------------------
# 2. Team Scouting Dossier
# -----------------------------------------------------------------------------
elif page == "📋 Team Scouting Dossier":
    st.title("📋 Comprehensive Team Scouting Dossier")
    
    if data["team_playstyles"].empty:
        st.warning("Team playstyles data not loaded.")
    else:
        teams = sorted(data["team_playstyles"]["team_id"].unique())
        selected_team = st.selectbox("Select Team ID", teams, index=0)
        
        team_row = data["team_playstyles"][data["team_playstyles"]["team_id"] == selected_team].iloc[0]
        
        # Summary Header
        st.markdown(f"""
        <div class="tactical-card">
            <h2>Team #{selected_team}</h2>
            <span class="badge-style">{team_row.get('archetype_name', team_row.get('playstyle', 'Standard'))}</span>
            <p style="margin-top: 10px; color: #a0aec0;">
                Matches Analyzed: <b>{team_row.get('matches', 'N/A')}</b> | 
                Confidence Score: <b>{team_row.get('playstyle_confidence', 1.0):.2f}</b>
            </p>
        </div>
        """, unsafe_allow_html=True)
        
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Possession Dominance", f"{team_row.get('possession_dominance', 50):.1f} / 100")
        with col2:
            st.metric("Low Block Tendency", f"{team_row.get('low_block', 50):.1f} / 100")
        with col3:
            st.metric("Press Intensity", f"{team_row.get('press_intensity', 50):.1f} / 100")
            
        st.markdown("---")
        
        # Team Radar & Zone Vulnerabilities
        c1, c2 = st.columns(2)
        with c1:
            st.subheader("📊 Tactical Phase Radar Profile")
            phases = [
                'phase_build-up', 'phase_chance_creation', 'phase_defending',
                'phase_discipline', 'phase_finishing', 'phase_pressing', 
                'phase_set_pieces', 'phase_transition'
            ]
            swot_df = data["team_swot"]
            if not swot_df.empty and selected_team in swot_df["team_id"].values:
                t_swot = swot_df[swot_df["team_id"] == selected_team].iloc[0]
                values = [t_swot.get(p, 50) for p in phases]
                labels = [p.replace("phase_", "").replace("_", " ").title() for p in phases]
                
                fig_radar = go.Figure(data=go.Scatterpolar(
                    r=values + [values[0]],
                    theta=labels + [labels[0]],
                    fill='toself',
                    fillcolor='rgba(31, 119, 180, 0.4)',
                    line=dict(color='#1f77b4', width=2)
                ))
                fig_radar.update_layout(
                    polar=dict(radialaxis=dict(visible=True, range=[0, 100])),
                    template="plotly_dark",
                    height=400
                )
                st.plotly_chart(fig_radar, use_container_width=True)
                
        with c2:
            st.subheader("🛡️ Team Defensive Vulnerability Grid")
            zv = data["zone_vulnerabilities"]
            if not zv.empty and selected_team in zv["team_id"].values:
                t_zv = zv[zv["team_id"] == selected_team]
                pivot_tzv = t_zv.pivot(index="channel", columns="band", values="vulnerability_index")
                fig_tzv = px.imshow(
                    pivot_tzv,
                    labels=dict(x="Band (Defensive -> Attacking)", y="Channel (Left -> Right)", color="Vuln Index"),
                    color_continuous_scale="YlOrRd",
                    template="plotly_dark",
                    height=400
                )
                st.plotly_chart(fig_tzv, use_container_width=True)

# -----------------------------------------------------------------------------
# 3. Matchup Simulator
# -----------------------------------------------------------------------------
elif page == "⚔️ Matchup Simulator":
    st.title("⚔️ Head-to-Head Tactical Matchup Simulator")
    st.markdown("Compare two clubs to project tactical friction points, exploited zones, and transition vulnerabilities.")
    
    if data["team_playstyles"].empty:
        st.warning("Playstyles data unavailable.")
    else:
        teams = sorted(data["team_playstyles"]["team_id"].unique())
        col_a, col_b = st.columns(2)
        with col_a:
            team_a = st.selectbox("Select Team A (Home / Attacking Focus)", teams, index=0)
        with col_b:
            team_b = st.selectbox("Select Team B (Away / Opponent)", teams, index=min(1, len(teams)-1))
            
        ta_row = data["team_playstyles"][data["team_playstyles"]["team_id"] == team_a].iloc[0]
        tb_row = data["team_playstyles"][data["team_playstyles"]["team_id"] == team_b].iloc[0]
        
        st.markdown("---")
        m1, m2, m3 = st.columns(3)
        with m1:
            diff_poss = ta_row.get("possession_dominance", 50) - tb_row.get("possession_dominance", 50)
            st.metric("Possession Battle", f"Team A {ta_row.get('possession_dominance', 50):.1f} vs {tb_row.get('possession_dominance', 50):.1f}", f"{diff_poss:+.1f} Δ")
        with m2:
            diff_press = ta_row.get("press_intensity", 50) - tb_row.get("press_intensity", 50)
            st.metric("Pressing Intensity", f"Team A {ta_row.get('press_intensity', 50):.1f} vs {tb_row.get('press_intensity', 50):.1f}", f"{diff_press:+.1f} Δ")
        with m3:
            diff_block = ta_row.get("low_block", 50) - tb_row.get("low_block", 50)
            st.metric("Low Block Depth", f"Team A {ta_row.get('low_block', 50):.1f} vs {tb_row.get('low_block', 50):.1f}", f"{diff_block:+.1f} Δ")

# -----------------------------------------------------------------------------
# 4. Player Ratings & Scouting
# -----------------------------------------------------------------------------
elif page == "⭐ Player Ratings & Scouting":
    st.title("⭐ Contextual Player Ratings & Scouting Leaderboards")
    
    if data["player_ratings"].empty:
        st.warning("Player ratings data unavailable.")
    else:
        df_p = data["player_ratings"]
        
        col1, col2, col3 = st.columns(3)
        with col1:
            positions = ["All"] + sorted(df_p["position_group"].dropna().unique().tolist())
            sel_pos = st.selectbox("Filter Position Group", positions)
        with col2:
            min_mins = st.slider("Minimum Estimated Minutes", 0, int(df_p["minutes"].max()), 300)
        with col3:
            search_id = st.text_input("Search Player ID", "")
            
        filtered = df_p[df_p["minutes"] >= min_mins]
        if sel_pos != "All":
            filtered = filtered[filtered["position_group"] == sel_pos]
        if search_id:
            filtered = filtered[filtered["player_id"].astype(str).str.contains(search_id)]
            
        st.markdown(f"**Showing {len(filtered)} players matching criteria:**")
        
        display_cols = [
            "player_id", "team_id", "position_group", "matches", "minutes", 
            "rating", "rating_percentile_overall", "comp_progression", 
            "comp_creation", "comp_finishing", "comp_defending"
        ]
        available_cols = [c for c in display_cols if c in filtered.columns]
        st.dataframe(
            filtered[available_cols].sort_values("rating", ascending=False).head(50),
            use_container_width=True
        )

# -----------------------------------------------------------------------------
# 5. Expected Threat (xT) Visualizer
# -----------------------------------------------------------------------------
elif page == "🗺️ Expected Threat (xT) Visualizer":
    st.title("🗺️ Self-Fitted Expected Threat (xT) Grid Surface")
    st.markdown("""
    The Expected Threat (xT) surface is self-calibrated on the 2.46M actions dataset via **Markov fixed-point value iteration** 
    on a $16 \\times 12$ spatial discretization grid.
    """)
    st.image("figures/xt_surface_heatmap.png", use_container_width=True)

# -----------------------------------------------------------------------------
# 6. Validation & Reliability Suite
# -----------------------------------------------------------------------------
elif page == "📈 Validation & Reliability Suite":
    st.title("📈 Historical Match Validation & Signal Calibration")
    st.markdown("""
    All features and models undergo rigorous **split-half cross-validation** (odd vs even match splits) 
    and out-of-sample goal differential prediction.
    """)
    
    st.image("figures/validation_reliability_chart.png", use_container_width=True)
    
    st.markdown("""
    ### Key Validation Takeaways:
    - **Tackle Success Rate Refuted**: Raw tackle success showed $r = -0.05$ (pure noise) and was replaced with **Clean Recovery Rate** ($r = 0.62$).
    - **Zone Vulnerability Calibration**: Reweighting defensive vulnerability by empirical reliability lifted composite stability from **0.36 to 0.63**.
    - **Predictive Power**: Team ratings predict held-out goal difference at **$r = 0.50$** with **71% sign accuracy**.
    """)
