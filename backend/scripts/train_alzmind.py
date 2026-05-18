import os
import torch
from PIL import Image
from torchvision import transforms
from transformers import ViTForImageClassification, ViTImageProcessor, TrainingArguments, Trainer

# 1. Custom Dataset Class jo HuggingFace Trainer ke sath 100% compatible hai
class AlzDataset(torch.utils.data.Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.image_paths = []
        self.labels = []
        
        # Folder ke naam hi hamari classes hain
        self.classes = sorted(os.listdir(root_dir))
        self.class_to_idx = {cls_name: i for i, cls_name in enumerate(self.classes)}
        
        # Saari images ke paths aur labels collect karna
        for cls_name in self.classes:
            cls_dir = os.path.join(root_dir, cls_name)
            if os.path.isdir(cls_dir):
                for img_name in os.listdir(cls_dir):
                    if img_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                        self.image_paths.append(os.path.join(cls_dir, img_name))
                        self.labels.append(self.class_to_idx[cls_name])

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        image = Image.open(img_path).convert("RGB")
        label = self.labels[idx]
        
        if self.transform:
            image = self.transform(image)
            
        return {"pixel_values": image, "labels": label}

def train_alzheimer_model():
    print("--- AlzMind (Vision Transformer) Setup Shuru Ho Raha Hai... ---")

    # Image Processor config fetch karna
    processor = ViTImageProcessor.from_pretrained("google/vit-base-patch16-224-in21k")

    # Data Preprocessing & Augmentation
    data_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=processor.image_mean, std=processor.image_std)
    ])

    train_dir = "data/alzheimer/train"
    test_dir = "data/alzheimer/test"

    print("Loading datasets from local folders...")
    train_dataset = AlzDataset(root_dir=train_dir, transform=data_transforms)
    test_dataset = AlzDataset(root_dir=test_dir, transform=data_transforms)

    print(f"Detected Classes: {train_dataset.classes}")
    print(f"Total Train Images: {len(train_dataset)}, Total Test Images: {len(test_dataset)}")

    # 2. Pre-trained Vision Transformer Model Load Karna
    print("--- HuggingFace se ViT Base Model Load Ho Raha Hai... ---")
    model = ViTForImageClassification.from_pretrained(
        "google/vit-base-patch16-224-in21k",
        num_labels=4,
        id2label={i: cls for cls, i in train_dataset.class_to_idx.items()},
        label2id=train_dataset.class_to_idx,
        ignore_mismatched_sizes=True
    )

    # 3. Training Arguments Configuration (Warning aur Error dono fix)
    training_args = TrainingArguments(
        output_dir="models/alzmind_output",
        per_device_train_batch_size=4,  # Chota batch size taaki system lag na kare
        per_device_eval_batch_size=4,
        num_train_epochs=3,
        learning_rate=2e-5,
        logging_dir="logs/alzmind",
        logging_steps=20,
        eval_strategy="epoch",         # Naya format (Purani warning fix)
        save_strategy="epoch",
        load_best_model_at_end=True,
        remove_unused_columns=False
    )

    # 4. Initialize Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=test_dataset,
    )

    print("\n--- [SUCCESS] AlzMind Pipeline completely ready! ---")
    print("Ab aap terminal me script fir se chala sakte hain.")

if __name__ == "__main__":
    train_alzheimer_model()