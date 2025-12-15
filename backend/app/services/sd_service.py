"""Stable Diffusion integration service for avatar generation."""

from typing import List, Dict, Any, Optional
import httpx
import base64
import random

from app.core.config import settings


class StableDiffusionService:
    """
    Service for generating character avatars using Stable Diffusion API.
    
    Supports multiple styles:
    - anime: Japanese animation style
    - cyberpunk: Futuristic sci-fi aesthetic
    - fantasy: Magical/fantasy art style
    
    For MVP, includes mock implementations that return placeholder images.
    """
    
    def __init__(self):
        self.api_key = settings.sd_api_key
        self.api_url = settings.sd_api_url
    
    @property
    def is_configured(self) -> bool:
        """Check if Stable Diffusion API is configured."""
        return bool(self.api_key)
    
    def get_style_prompt(self, style: str) -> str:
        """
        Get the prompt suffix for a given style.
        
        Args:
            style: Style name (anime, cyberpunk, fantasy)
            
        Returns:
            Style-specific prompt suffix
        """
        prompts = {
            "anime": (
                "anime style, vibrant colors, detailed eyes, "
                "soft shading, beautiful character art, high quality, "
                "studio ghibli inspired, cel shaded"
            ),
            "cyberpunk": (
                "cyberpunk style, neon colors, futuristic, "
                "high tech, chrome accents, holographic elements, "
                "blade runner aesthetic, digital art"
            ),
            "fantasy": (
                "fantasy art style, magical, ethereal glow, "
                "detailed illustration, mystical atmosphere, "
                "enchanted, fairy tale aesthetic, digital painting"
            ),
        }
        return prompts.get(style, prompts["anime"])
    
    def get_negative_prompt(self) -> str:
        """
        Get the negative prompt for better generation quality.
        
        Returns:
            Negative prompt string
        """
        return (
            "low quality, blurry, distorted, deformed, ugly, "
            "bad anatomy, bad hands, extra limbs, duplicate, "
            "watermark, signature, text, cropped"
        )
    
    async def generate_avatars(
        self,
        style: str,
        appearance: Optional[Dict[str, Any]] = None,
        count: int = 4,
    ) -> List[str]:
        """
        Generate avatar images for a character.
        
        Args:
            style: Visual style (anime, cyberpunk, fantasy)
            appearance: Optional appearance details
            count: Number of images to generate
            
        Returns:
            List of image URLs or base64 data URIs
        """
        if not self.is_configured:
            return self._get_placeholder_avatars(style, count)
        
        try:
            # Build prompt from style and appearance
            style_prompt = self.get_style_prompt(style)
            name = appearance.get("name", "companion") if appearance else "companion"
            
            prompt = (
                f"portrait of a cute virtual companion named {name}, "
                f"friendly expression, looking at viewer, "
                f"{style_prompt}, masterpiece, best quality"
            )
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_url}/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                    json={
                        "text_prompts": [
                            {"text": prompt, "weight": 1},
                            {"text": self.get_negative_prompt(), "weight": -1},
                        ],
                        "cfg_scale": 7,
                        "height": 1024,
                        "width": 1024,
                        "samples": count,
                        "steps": 30,
                    },
                    timeout=60.0,
                )
                
                if response.status_code == 200:
                    data = response.json()
                    images = []
                    for artifact in data.get("artifacts", []):
                        if artifact.get("finishReason") == "SUCCESS":
                            base64_image = artifact.get("base64")
                            if base64_image:
                                images.append(f"data:image/png;base64,{base64_image}")
                    return images if images else self._get_placeholder_avatars(style, count)
                    
        except Exception as e:
            print(f"Stable Diffusion generation failed: {e}")
        
        return self._get_placeholder_avatars(style, count)
    
    def _get_placeholder_avatars(self, style: str, count: int) -> List[str]:
        """
        Get placeholder avatar URLs for testing without API.
        
        Args:
            style: Visual style
            count: Number of placeholders
            
        Returns:
            List of placeholder image URLs
        """
        # Use style-specific placeholder colors
        colors = {
            "anime": ["ff6b9d", "c084fc", "67e8f9", "fbbf24"],
            "cyberpunk": ["22d3ee", "a855f7", "f472b6", "84cc16"],
            "fantasy": ["a78bfa", "f472b6", "34d399", "fcd34d"],
        }
        
        style_colors = colors.get(style, colors["anime"])
        
        placeholders = []
        for i in range(count):
            color = style_colors[i % len(style_colors)]
            # Using placeholder service
            url = f"https://via.placeholder.com/512x512/{color}/ffffff?text={style.title()}+Avatar+{i+1}"
            placeholders.append(url)
        
        return placeholders
    
    def get_placeholder_avatars(self, style: str, count: int = 4) -> List[str]:
        """
        Public method to get placeholder avatar URLs.
        
        Args:
            style: Visual style (anime, cyberpunk, fantasy)
            count: Number of placeholders to generate
            
        Returns:
            List of placeholder image URLs
        """
        return self._get_placeholder_avatars(style, count)
    
    async def generate_portraits(
        self,
        style: str,
        prompt: str = "",
        count: int = 4,
    ) -> List[str]:
        """
        Generate portrait images for character creation (Avatar Studio).
        
        This is the primary method for the Avatar Studio wizard.
        Generates portrait-focused images optimized for character avatars.
        
        Args:
            style: Visual style (anime, cyberpunk, fantasy)
            prompt: User's appearance description (e.g., "рыжие волосы, зеленые глаза")
            count: Number of variants to generate (default 4)
            
        Returns:
            List of image URLs or base64 data URIs
        """
        if not self.is_configured:
            return self._get_placeholder_avatars(style, count)
        
        try:
            # Build enhanced prompt for portraits
            style_prompt = self.get_style_prompt(style)
            
            # Combine user prompt with style prompt
            if prompt:
                full_prompt = (
                    f"portrait of a cute virtual companion, {prompt}, "
                    f"facing viewer, detailed face, expressive eyes, "
                    f"{style_prompt}, masterpiece, best quality, "
                    f"portrait composition, centered face"
                )
            else:
                full_prompt = (
                    f"portrait of a cute virtual companion, "
                    f"friendly expression, facing viewer, detailed face, "
                    f"{style_prompt}, masterpiece, best quality, "
                    f"portrait composition, centered face"
                )
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_url}/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                    json={
                        "text_prompts": [
                            {"text": full_prompt, "weight": 1},
                            {"text": self.get_negative_prompt(), "weight": -1},
                        ],
                        "cfg_scale": 7,
                        "height": 1024,
                        "width": 1024,
                        "samples": count,
                        "steps": 30,
                    },
                    timeout=90.0,
                )
                
                if response.status_code == 200:
                    data = response.json()
                    images = []
                    for artifact in data.get("artifacts", []):
                        if artifact.get("finishReason") == "SUCCESS":
                            base64_image = artifact.get("base64")
                            if base64_image:
                                images.append(f"data:image/png;base64,{base64_image}")
                    return images if images else self._get_placeholder_avatars(style, count)
                    
        except Exception as e:
            print(f"Portrait generation failed: {e}")
        
        return self._get_placeholder_avatars(style, count)
    
    async def upscale_image(
        self,
        image_data: str,
        scale: int = 2,
    ) -> Optional[str]:
        """
        Upscale an image using Stable Diffusion.
        
        Args:
            image_data: Base64 encoded image
            scale: Upscale factor (2 or 4)
            
        Returns:
            Upscaled image as base64 data URI, or None on failure
        """
        if not self.is_configured:
            return image_data  # Return original if not configured
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_url}/v1/generation/esrgan-v1-x2plus/image-to-image/upscale",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Accept": "application/json",
                    },
                    files={
                        "image": base64.b64decode(image_data.split(",")[1] if "," in image_data else image_data),
                    },
                    timeout=60.0,
                )
                
                if response.status_code == 200:
                    data = response.json()
                    for artifact in data.get("artifacts", []):
                        if artifact.get("finishReason") == "SUCCESS":
                            return f"data:image/png;base64,{artifact.get('base64')}"
                            
        except Exception as e:
            print(f"Image upscale failed: {e}")
        
        return None


# Singleton instance
sd_service = StableDiffusionService()
