import os
print(f"CWD: {os.getcwd()}")
path = "../dataset/train"
print(f"Path: {path}")
print(f"Exists: {os.path.exists(path)}")
print(f"Abs Path: {os.path.abspath(path)}")
if os.path.exists(path):
    print(f"Contents: {os.listdir(path)}")
else:
    parent = os.path.dirname(path)
    if os.path.exists(parent):
        print(f"Parent contents: {os.listdir(parent)}")
