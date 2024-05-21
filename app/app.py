from flask import Flask, render_template, session, redirect
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, emit, join_room
import uuid

app = Flask(__name__)
socketio = SocketIO(app)
socketio.manage_session = False
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite"
app.config["SECRET_KEY"] = "81f2dc22-5662-4df6-ab2e-60235e6fc87d"
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_TYPE"] = "sqlalchemy"
app.config["PERMANENT_SESSION_LIFETIME"] = 60 * 60 * 24  # 24 hours
db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column("user_id", db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    vote = db.Column(db.Integer)
    room = db.Column(db.String(100))

    def __init__(self, name: str, room: str, vote: int = None):
        self.name = name
        self.room = room
        self.vote = vote

# Endpoints
@app.route("/")
def random_room():
    # Append a unique identifier to the session ID
    session["session_id"] = str(uuid.uuid4()) + '-' + str(uuid.uuid4())
    
    uid_str = uuid.uuid4().urn
    room = uid_str[9:]
    return redirect("/" + str(room), code=302)

@app.route("/favicon.ico")
def favicon():
    return "Not Found", 404

@app.route("/<room_id>")
def load_room(room_id="default"):
    user = load_user(room_id)
    session["user_room"] = room_id
    user.room = room_id
    user.vote = None
    db.session.commit()
    return render_template(
        "game.html",
        title="Poker planning (BB8)",
        votes=["☕️", 1, 2, 3, 5, 8, 13, 21, "Don't know"],
        user=user,
        profile_picture=user.name.split(" ")[0].lower() + '.jpg',
        players=get_users_in_room(room_id),
    )

@socketio.on("connect")
def connect():
    user = load_user(session.get("user_room", "default"))
    join_room(user.room)
    socketio.emit("name", {"name": user.name, "id": user.id}, room=user.room)

@socketio.on("vote")
def handle_vote(data):
    user = load_user(session["user_room"])
    if str(session["user_vote"]) == str(data["data"]):
        user.vote = None
        session["user_vote"] = None
    else:
        user.vote = sanitize_vote(data["data"])
        session["user_vote"] = user.vote

    emit(
        "vote",
        [{"user": user.id, "name": user.name, "value": "Voted" if user.vote is not None else None}],
        room=user.room,
    )
    db.session.commit()

@socketio.on("show")
def show():
    room_id = session.get("user_room", "default")
    votes = []
    for user in get_users_in_room(room_id):
        votes.append({"user": user.id, "name": user.name, "value": user.vote})
    emit("vote", votes, room=room_id)

# Helper functions
def create_initial_users():
    scrum_users = [
        "Kalyani Kalyani", "Shawn van den Berg", "Avinash Haldkar",
        "Hans Otto", "Himanshi Maheshwari", "Janet Potagoli"
    ]
    for user_name in scrum_users:
        user = User(name=user_name, room="default")
        db.session.add(user)
    db.session.commit()

def get_users_in_room(room_id):
    return User.query.filter(User.room == room_id).all()

def load_user(room_id):
    if "user_id" in session:
        user = User.query.get(session["user_id"])
    else:
        # Find an available user not yet assigned to a room
        available_user = User.query.filter_by(room="default").first()
        if not available_user:
            raise Exception("No more available users.")
        available_user.room = room_id
        db.session.commit()
        session["user_id"] = available_user.id
        user = available_user

    session["user_name"] = user.name
    session["user_vote"] = user.vote
    session["user_room"] = user.room
    return user

def sanitize_vote(user_vote):
    return user_vote.replace('\n', '').strip() if user_vote else None

# Entrypoint
with app.app_context():
    db.create_all()
    create_initial_users()
    db.session.commit()

if __name__ == "__main__":
    socketio.run(app, debug=True)
