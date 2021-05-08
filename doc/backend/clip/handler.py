import clip
import torch
from base64 import b64decode
from io import BytesIO
from json import dumps
from PIL import Image
from os.path import expanduser
from torchvision.datasets import CIFAR100

def handle(req):

    model, preprocess = clip.load('ViT-B/32')
    cifar100 = CIFAR100(root=expanduser("~/.cache"), download = True, train = False)

    image_input = preprocess(Image.open(BytesIO(b64decode(req)))).unsqueeze(0)
    text_inputs = torch.cat([clip.tokenize(f"a photo of a {c}") for c in cifar100.classes])

    with torch.no_grad():
        image_features = model.encode_image(image_input)
        text_features = model.encode_text(text_inputs)

    image_features /= image_features.norm(dim = -1, keepdim = True)
    text_features /= text_features.norm(dim = -1, keepdim = True)
    similarity = (100.0 * image_features @ text_features.T).softmax(dim = -1)
    values, indices = similarity[0].topk(5)

    response = {}

    for value, index in zip(values, indices):
        response[f"{cifar100.classes[index]:>16s}"] = f"{100 * value.item():.2f}%"

    return dumps(response)
