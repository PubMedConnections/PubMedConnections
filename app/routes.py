from flask import render_template
from . import app

@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.route("/")
def index():
    return render_template('home.html')


@app.route("/exampleGraph")
def exampleGraph():
    return render_template('T.html')
