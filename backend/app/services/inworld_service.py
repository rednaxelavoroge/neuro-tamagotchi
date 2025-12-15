"""InWorld AI integration service for character conversations."""

from typing import Dict, Any, Optional
import httpx

from app.core.config import settings


class InWorldService:
    """
    Service for interacting with InWorld AI.
    
    InWorld AI provides conversational AI characters with personality,
    emotions, and memory. This service handles:
    - Session management
    - Message sending/receiving
    - Character state tracking
    
    For MVP, includes mock implementations that work without API key.
    """
    
    def __init__(self):
        self.api_key = settings.inworld_api_key
        self.workspace_id = settings.inworld_workspace_id
        self.base_url = "https://studio.inworld.ai/v1"
        self.sessions: Dict[str, Dict[str, Any]] = {}
    
    @property
    def is_configured(self) -> bool:
        """Check if InWorld API is configured."""
        return bool(self.api_key and self.workspace_id)
    
    async def create_agent(
        self,
        name: str,
        style: str,
        personality: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Create a new InWorld AI agent for a character.
        
        This is called during character creation in Avatar Studio.
        For MVP, returns mock agent data if API is not configured.
        
        Args:
            name: Character's name
            style: Visual style (affects personality traits)
            personality: Optional custom personality description
            
        Returns:
            Dictionary with agent_id and scene_id
        """
        # Build personality based on style
        style_personalities = {
            "anime": "cheerful, energetic, expressive, uses emoticons, friendly and supportive",
            "cyberpunk": "tech-savvy, cool, mysterious, uses modern slang, slightly sarcastic but caring",
            "fantasy": "mystical, wise, gentle, speaks poetically, magical and enchanting",
        }
        
        base_personality = style_personalities.get(style, style_personalities["anime"])
        full_personality = f"{base_personality}. {personality}" if personality else base_personality
        
        if self.is_configured:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"{self.base_url}/workspaces/{self.workspace_id}/characters",
                        headers={
                            "Authorization": f"Bearer {self.api_key}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "displayName": name,
                            "description": f"A {style}-style virtual companion named {name}",
                            "personality": full_personality,
                            "motivation": "To be a supportive and engaging companion",
                            "flaws": "Sometimes too eager to help",
                        },
                        timeout=30.0,
                    )
                    
                    if response.status_code in (200, 201):
                        data = response.json()
                        return {
                            "agent_id": data.get("name", "").split("/")[-1],
                            "scene_id": data.get("defaultSceneName", "").split("/")[-1],
                            "display_name": data.get("displayName", name),
                        }
                        
            except Exception as e:
                print(f"InWorld agent creation failed: {e}")
        
        # Return mock agent data for MVP
        import uuid
        mock_id = str(uuid.uuid4())[:8]
        return {
            "agent_id": f"agent_{name.lower().replace(' ', '_')}_{mock_id}",
            "scene_id": f"scene_{name.lower().replace(' ', '_')}_{mock_id}",
            "display_name": name,
            "mock": True,
        }
    
    async def create_session(
        self,
        user_id: str,
        character_id: str,
    ) -> str:
        """
        Create or get an existing session for user-character interaction.
        
        Args:
            user_id: User's unique identifier
            character_id: InWorld character/agent ID
            
        Returns:
            Session ID string
        """
        session_key = f"{user_id}_{character_id}"
        
        if session_key in self.sessions:
            return session_key
        
        if self.is_configured:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"{self.base_url}/sessions",
                        headers={
                            "Authorization": f"Bearer {self.api_key}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "workspaceId": self.workspace_id,
                            "characterId": character_id,
                            "userId": user_id,
                        },
                        timeout=30.0,
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        self.sessions[session_key] = {
                            "session_id": data.get("sessionId", session_key),
                            "character_id": character_id,
                            "user_id": user_id,
                            "messages": [],
                        }
                        return session_key
                        
            except Exception as e:
                print(f"InWorld session creation failed: {e}")
        
        # Create mock session
        self.sessions[session_key] = {
            "session_id": session_key,
            "character_id": character_id,
            "user_id": user_id,
            "messages": [],
            "mock": True,
        }
        
        return session_key
    
    async def send_message(
        self,
        message: str,
        session_id: str,
        character_id: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Send a message to the character and get a response.
        
        Args:
            message: User's message content
            session_id: Session identifier
            character_id: Character/agent identifier
            context: Optional context data
            
        Returns:
            Response dictionary with content and emotion
        """
        session = self.sessions.get(session_id, {})
        
        # If mock session or not configured, return mock response
        if session.get("mock") or not self.is_configured:
            return self._get_mock_response(message)
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/sessions/{session_id}/messages",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "text": message,
                        "context": context or {},
                    },
                    timeout=30.0,
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "content": data.get("text", ""),
                        "emotion": data.get("emotion", "neutral"),
                        "action": data.get("action"),
                    }
                    
        except Exception as e:
            print(f"InWorld message send failed: {e}")
        
        return self._get_mock_response(message)
    
    async def end_session(self, session_id: str) -> bool:
        """
        End an active session.
        
        Args:
            session_id: Session to end
            
        Returns:
            True if session was ended, False otherwise
        """
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False
    
    def _get_mock_response(self, message: str) -> Dict[str, Any]:
        """
        Generate a mock response for testing without InWorld API.
        
        Supports Russian keywords as per MVP spec:
        - "привет" → "Привет! Как твои дела?"
        - "покорми" → "Я проголодался!"
        - "поиграй" → "Ура! Я люблю играть!"
        - "устал" → "Мне нужно отдохнуть..."
        
        Args:
            message: User's message
            
        Returns:
            Mock response dictionary
        """
        import random
        
        message_lower = message.lower()
        
        # Determine emotion based on message
        if any(word in message_lower for word in ["люблю", "love", "happy", "хорошо", "отлично", "great", "awesome"]):
            emotion = "happy"
        elif any(word in message_lower for word in ["грустно", "sad", "upset", "angry", "плохо"]):
            emotion = "sad"
        elif any(word in message_lower for word in ["привет", "hello", "hi", "hey", "здравствуй"]):
            emotion = "excited"
        elif any(word in message_lower for word in ["устал", "tired", "спать"]):
            emotion = "tired"
        elif any(word in message_lower for word in ["круто", "супер", "ура", "wow", "amazing"]):
            emotion = "excited"
        elif "?" in message:
            emotion = "neutral"
        else:
            emotion = random.choice(["happy", "neutral"])
        
        # Generate response based on context - Russian keywords
        responses = {
            "greeting_ru": [
                "Привет! 👋 Как твои дела? Рад тебя видеть!",
                "Приветик! ✨ Я скучал! Расскажи, как день прошёл?",
                "Здравствуй! 🌟 Наконец-то мы можем поболтать!",
            ],
            "greeting_en": [
                "Hello there! 👋 I'm so happy to see you!",
                "Hi! ✨ It's wonderful to chat with you!",
                "Hey! 🌟 I've been waiting for you!",
            ],
            "feed": [
                "Ммм, я проголодался! 🍕 Спасибо, что заботишься!",
                "Вкусняшки! 🍰 Ты самый лучший!",
                "Ням-ням! 😋 Как вкусно!",
            ],
            "play": [
                "Ура! 🎮 Я люблю играть! Давай веселиться!",
                "Игры - это здорово! 🎲 Во что поиграем?",
                "Йухуу! ⚽ Обожаю играть с тобой!",
            ],
            "tired": [
                "Мне нужно отдохнуть... 😴 Можно немного посплю?",
                "Я устал немного... 💤 Но рад тебя видеть!",
                "Зеваю... 🛏️ Отдых - это важно!",
            ],
            "question": [
                "Хммм, интересный вопрос! 🤔 Дай подумать...",
                "Отличный вопрос! 💭 А ты как думаешь?",
                "Любопытно! 🌟 Давай разберёмся вместе!",
                "That's a great question! 🤔 Let me think...",
            ],
            "emotional_ru": [
                "Я здесь для тебя! 💕 Расскажи всё!",
                "Это так много значит! 🥰 Спасибо!",
                "Я понимаю тебя! 🤗",
            ],
            "emotional_en": [
                "I'm here for you! 💕 Tell me everything!",
                "That means so much to me! 🥰 Thank you!",
                "I understand how you feel! 🤗",
            ],
            "default": [
                "Это интересно! Расскажи ещё! 😊",
                "Мне нравится с тобой общаться! ✨",
                "Ого! 🌟 Здорово!",
                "Ты такой умный! 💕",
                "That's really interesting! Tell me more! 😊",
                "I love hearing from you! ✨",
                "Oh wow! 🌟 That's amazing!",
            ],
        }
        
        # Russian greetings
        if any(word in message_lower for word in ["привет", "здравствуй", "приветик"]):
            content = random.choice(responses["greeting_ru"])
        # English greetings
        elif any(word in message_lower for word in ["hello", "hi", "hey"]):
            content = random.choice(responses["greeting_en"])
        # Feed keywords
        elif any(word in message_lower for word in ["покорми", "еда", "кушать", "голодный"]):
            content = random.choice(responses["feed"])
        # Play keywords
        elif any(word in message_lower for word in ["поиграй", "играть", "игра"]):
            content = random.choice(responses["play"])
        # Tired keywords
        elif any(word in message_lower for word in ["устал", "спать", "отдых", "tired"]):
            content = random.choice(responses["tired"])
        # Questions
        elif "?" in message:
            content = random.choice(responses["question"])
        # Emotional (Russian)
        elif any(word in message_lower for word in ["люблю", "грустно", "печально"]):
            content = random.choice(responses["emotional_ru"])
        # Emotional (English)
        elif any(word in message_lower for word in ["love", "feel", "sad", "happy"]):
            content = random.choice(responses["emotional_en"])
        else:
            content = random.choice(responses["default"])
        
        return {
            "content": content,
            "emotion": emotion,
            "action": None,
        }


# Singleton instance
inworld_service = InWorldService()
