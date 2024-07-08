import uuid
import logging

from flask import Flask, render_template, session, redirect, request
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, join_room
from flask_oidc import OpenIDConnect
from flask_session import Session

from constants import (
    DB_SETTINGS,
    SESSION_SETTINGS,
    ENVIRONMENT,
    ENV_SETTINGS,
    OIDC_SETTINGS,
)
from utilities import get_or_create

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.config.update(DB_SETTINGS)

socketio = SocketIO(app)
socketio.manage_session = False
app.config.update(SESSION_SETTINGS)

db = SQLAlchemy(app)
app.config.update(ENV_SETTINGS[ENVIRONMENT])
Session(app)

app.config.update(OIDC_SETTINGS)
oidc = OpenIDConnect(app)

# Models
class User(db.Model):
    id = db.Column("user_id", db.Integer, primary_key=True)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    email = db.Column(db.String(100))
    vote = db.Column(db.Integer)
    room = db.Column(db.String(100))

    def __init__(
        self,
        first_name: str,
        last_name: str,
        email: str,
        room: str,
        vote: int = None,
    ):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.room = room
        self.vote = vote

# Routes
@app.route("/")
@oidc.require_login
def random_room():
    session["session_id"] = str(uuid.uuid4()) + "-" + str(uuid.uuid4())
    room = uuid.uuid4().urn[9:]
    return redirect("/" + str(room), code=302)

@oidc.accept_token
@app.route("/<room_id>")
def load_room(room_id="default"):
    user_instance = load_user(room_id)
    return render_template(
        "game.html",
        title="Poker planning (BB8)",
        votes=["☕️", 1, 2, 3, 5, 8, 13, 21, "Don't know"],
        user=user_instance,
        profile_picture=user_instance.first_name.split(" ")[0].lower() + ".jpg",
        players=get_users_in_room(room_id),
        average=0,
        reveal=False,
    )

@socketio.on("connect")
def connect():
    user = load_user(session.get("user_room", "default"))
    join_room(user.room)
    socketio.emit("name", {"name": user.first_name, "id": user.id}, room=user.room)

@app.route("/vote", methods=["GET"])
def handle_vote():
    vote_value = request.args.get("vote")
    user = load_user(session["user_room"])
    user.vote = sanitize_vote(vote_value)
    session["user_vote"] = user.vote
    db.session.commit()

    return render_template(
        "players.html",
        players=get_users_in_room(user.room),
        average=0,
        reveal=False,
    )

@app.route("/reveal-votes", methods=["GET"])
def reveal_votes():
    room_id = session.get("user_room", "default")
    players = get_users_in_room(room_id)
    average = round(
        sum([player.vote for player in players if player.vote is not None]) / len(players),
        2,
    )
    return render_template(
        "players.html", players=players, average=average, reveal=True
    )

# Helper functions
def get_users_in_room(room_id):
    return User.query.filter(User.room == room_id).all()

def load_user(room_id):
    sso_info = session["oidc_auth_profile"]

    user_instance, _ = get_or_create(
        session=db.session,
        model=User,
        defaults={
            "first_name": sso_info["given_name"],
            "last_name": sso_info["family_name"],
            "room": room_id,
            "vote": None,
        },
        email=sso_info["email"],
    )

    user_instance.room = room_id
    user_instance.vote = None
    db.session.commit()

    session.update(
        {
            "user_id": user_instance.id,
            "user_name": f"{user_instance.first_name} {user_instance.last_name}",
            "user_vote": user_instance.vote,
            "user_room": room_id,
        }
    )
    return user_instance

def sanitize_vote(user_vote):
    return user_vote.replace("\n", "").strip() if user_vote else None

# Entrypoint
with app.app_context():
    db.create_all()
    db.session.commit()

if __name__ == "__main__":
    app.run(debug=True)
