#!/usr/bin/env bash

SESSION="imbaio"

tmux -2 new-session -d -s $SESSION

tmux new-window -t $SESSION:1 -n 'watch / start'
tmux split-window -h
tmux select-pane -t 0
tmux send-keys "npm run watch-content" C-m
tmux select-pane -t 1
tmux send-keys "npm run start" C-m

tmux -2 attach-session -t $SESSION