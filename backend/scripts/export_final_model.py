from transformers import ViTForImageClassification, AutoImageProcessor

checkpoint = "./models/alzmind_vit_output/checkpoint-6600"
output_path = "./models/alzmind_final"

print("Loading model from checkpoint-6600...")
model = ViTForImageClassification.from_pretrained(checkpoint)

print("Loading processor from HuggingFace (standard ViT processor)...")
processor = AutoImageProcessor.from_pretrained("google/vit-base-patch16-224-in21k")

print("Saving final model + processor...")
model.save_pretrained(output_path)
processor.save_pretrained(output_path)

print(f"Done! Model saved at: {output_path}")