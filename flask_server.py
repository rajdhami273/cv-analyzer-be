from flask import Flask, request
from resume_parser import resumeparse
import spacy
nlp = spacy.load("en_core_web_sm")
app = Flask(__name__)


@app.route('/flask', methods=['GET'])
def index():
    return "Flask server"


@app.route('/parse-resume', methods=["GET"])
def parser():
    # path = request.form["fileUrl"]
    path = request.args.get("resumepath")
    print(path)
    data = resumeparse.read_file(path)
    return data


if __name__ == "__main__":
    app.run(port=5000, debug=True)


# python3 -m nltk.downloader punkt
# python3 -m nltk.downloader averaged_perceptron_tagger
# python3 -m nltk.downloader universal_tagset
# python3 -m nltk.downloader wordnet
# python3 -m nltk.downloader brown
# python3 -m nltk.downloader maxent_ne_chunker
