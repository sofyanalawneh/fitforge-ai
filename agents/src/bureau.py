"""Entrypoint that runs the workout and meal agents in a single local process.

Run with: python -m src.bureau (from the agents/ directory)

A uagents Bureau serves all of its member agents from ONE shared HTTP server/port
(it overwrites each agent's own endpoint), so the two agents are disambiguated by
REST path instead of by port: /workout/generate and /meal/generate on BUREAU_PORT.
"""

import os

from uagents import Bureau

from src.meal_agent import agent as meal_agent
from src.workout_agent import agent as workout_agent

BUREAU_PORT = int(os.environ.get("BUREAU_PORT", "8000"))

bureau = Bureau(port=BUREAU_PORT)
bureau.add(workout_agent)
bureau.add(meal_agent)

if __name__ == "__main__":
    bureau.run()
