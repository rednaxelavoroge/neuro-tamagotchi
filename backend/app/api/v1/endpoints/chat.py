"""Chat endpoints for character conversations."""

from datetime import datetime
from typing import List, Dict, Any, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.character import Character
from app.models.user import User
from app.services.inworld_service import inworld_service

router = APIRouter(prefix="/chat", tags=["Chat"])


# ============================================================================
# Constants
# ============================================================================

ENERGY_COST_PER_MESSAGE = 1       # Energy deducted per message
MOOD_POSITIVE_BOOST = 2           # Mood increase for positive sentiment
MOOD_NEGATIVE_PENALTY = 1         # Mood decrease for negative sentiment
BOND_INCREMENT = 1                # Bond increase amount
BOND_INCREMENT_EVERY_N_MESSAGES = 10  # Bond increases every N messages
MAX_MESSAGES_HISTORY = 50         # Max messages to return in history


# ============================================================================
# Schemas
# ============================================================================

class ChatMessage(BaseModel):
    """Schema for chat message."""
    
    id: str = Field(description="Message unique identifier")
    character_id: str = Field(description="Character this message belongs to")
    role: str = Field(description="Message role: user or assistant")
    content: str = Field(description="Message content")
    emotion: Optional[str] = Field(None, description="Character emotion for assistant messages")
    created_at: datetime = Field(description="Message timestamp")


class SendMessageRequest(BaseModel):
    """Schema for sending a message (matches task spec)."""
    
    message: str = Field(min_length=1, max_length=2000, description="Message content")
    session_id: Optional[str] = Field(None, description="Optional session ID for continuity")


class SendMessageRequestAlt(BaseModel):
    """Alternative schema for sending a message (legacy support)."""
    
    content: str = Field(min_length=1, max_length=2000, description="Message content")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")


class ParamsUpdated(BaseModel):
    """Schema for parameter changes."""
    
    energy: int = Field(description="Energy change amount")
    mood: int = Field(description="Mood change amount")
    bond: int = Field(description="Bond change amount")


class ChatResponse(BaseModel):
    """Response schema for chat endpoint (matches task spec)."""
    
    response: str = Field(description="AI character's response text")
    session_id: str = Field(description="Session ID for conversation continuity")
    emotion: str = Field(description="Character emotion: neutral, happy, sad, excited, tired")
    params_updated: ParamsUpdated = Field(description="Parameter changes from this message")


class CharacterReaction(BaseModel):
    """Schema for character reaction to message."""
    
    emotion: str = Field(description="Character's emotional state")
    animation: str = Field(description="Animation to play")
    param_changes: Optional[Dict[str, int]] = Field(None, description="Parameter changes")


class SendMessageResponse(BaseModel):
    """Schema for message response (legacy format)."""
    
    message: ChatMessage = Field(description="The assistant's response message")
    character_reaction: Optional[CharacterReaction] = Field(None, description="Character reaction")


class ChatHistoryResponse(BaseModel):
    """Schema for chat history response."""
    
    items: List[ChatMessage] = Field(description="Messages in current page")
    total: int = Field(description="Total number of messages")
    page: int = Field(description="Current page number")
    page_size: int = Field(description="Messages per page")
    total_pages: int = Field(description="Total number of pages")


# ============================================================================
# In-memory storage (in production, use a database table)
# ============================================================================

# Session key -> list of messages
chat_sessions: Dict[str, List[ChatMessage]] = {}

# Session key -> message count (for bond calculation)
message_counts: Dict[str, int] = {}


# ============================================================================
# Sentiment Analysis
# ============================================================================

POSITIVE_KEYWORDS = [
    "хорошо", "отлично", "люблю", "класс", "супер", "ура", "круто",
    "прекрасно", "замечательно", "восхитительно", "радость", "счастье",
    "love", "great", "awesome", "amazing", "wonderful", "happy", "good",
    "excellent", "fantastic", "beautiful", "nice", "perfect", "best",
]

NEGATIVE_KEYWORDS = [
    "плохо", "грустно", "скучно", "злой", "ненавижу", "устал", "печаль",
    "ужас", "отстой", "тоска", "обидно", "разочарование",
    "bad", "sad", "angry", "hate", "tired", "boring", "awful", "terrible",
    "upset", "disappointed", "annoyed", "frustrated", "unhappy",
]


def analyze_sentiment(message: str) -> str:
    """
    Analyze message sentiment.
    
    Returns:
        'positive', 'negative', or 'neutral'
    """
    message_lower = message.lower()
    
    positive_count = sum(1 for word in POSITIVE_KEYWORDS if word in message_lower)
    negative_count = sum(1 for word in NEGATIVE_KEYWORDS if word in message_lower)
    
    if positive_count > negative_count:
        return "positive"
    elif negative_count > positive_count:
        return "negative"
    return "neutral"


def determine_emotion(message: str, character_energy: int) -> str:
    """
    Determine character emotion based on message and state.
    
    Returns:
        One of: neutral, happy, sad, excited, tired
    """
    # If energy is low, character is tired
    if character_energy < 30:
        return "tired"
    
    message_lower = message.lower()
    
    # Check for excitement
    if any(word in message_lower for word in ["ура", "круто", "супер", "wow", "amazing", "awesome"]):
        return "excited"
    
    # Check for sadness
    if any(word in message_lower for word in ["грустно", "печаль", "sad", "upset", "sorry"]):
        return "sad"
    
    # Check for happiness
    if any(word in message_lower for word in ["хорошо", "отлично", "люблю", "good", "great", "love", "happy"]):
        return "happy"
    
    return "neutral"


# ============================================================================
# Endpoints
# ============================================================================

@router.post("/{character_id}/chat", response_model=ChatResponse)
async def chat_with_character(
    character_id: UUID,
    request: SendMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ChatResponse:
    """
    Send a message to a character and get an AI response.
    
    This is the main chat endpoint for the companion interaction screen.
    
    Flow:
    1. Verify character belongs to user
    2. Send message to InWorld AI (mock for MVP)
    3. Update character parameters:
       - energy: -1 per message
       - mood: +2 if positive sentiment, -1 if negative
       - bond: +1 every 10 messages
    4. Log conversation
    5. Return AI response with emotion
    
    Args:
        character_id: UUID of the character to chat with
        request: Message content and optional session_id
        
    Returns:
        AI response with emotion and parameter updates
        
    Raises:
        404: Character not found or doesn't belong to user
    """
    # Verify character belongs to user
    character = db.query(Character).filter(
        Character.id == character_id,
        Character.user_id == current_user.id,
    ).first()
    
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found",
        )
    
    # Get or create session
    session_id = request.session_id or f"{current_user.id}_{character_id}"
    if session_id not in chat_sessions:
        chat_sessions[session_id] = []
        message_counts[session_id] = 0
    
    # Store user message
    user_message = ChatMessage(
        id=str(uuid4()),
        character_id=str(character_id),
        role="user",
        content=request.message,
        created_at=datetime.utcnow(),
    )
    chat_sessions[session_id].append(user_message)
    message_counts[session_id] += 1
    
    # Analyze sentiment
    sentiment = analyze_sentiment(request.message)
    
    # Get AI response
    try:
        await inworld_service.create_session(
            user_id=str(current_user.id),
            character_id=character.inworld_agent_id or "default",
        )
        
        response = await inworld_service.send_message(
            message=request.message,
            session_id=session_id,
            character_id=character.inworld_agent_id or "default",
        )
        
        response_content = response.get("content", "I'm thinking...")
        
    except Exception as e:
        print(f"InWorld error: {e}")
        response_content = get_mock_response(request.message, character.name)
    
    # Determine emotion based on message and character state
    emotion = determine_emotion(request.message, character.params_energy)
    
    # Calculate parameter changes
    energy_change = -ENERGY_COST_PER_MESSAGE
    
    # Mood change based on sentiment
    if sentiment == "positive":
        mood_change = MOOD_POSITIVE_BOOST
    elif sentiment == "negative":
        mood_change = -MOOD_NEGATIVE_PENALTY
    else:
        mood_change = 0
    
    # Bond increases every N messages
    total_messages = message_counts[session_id]
    if total_messages % BOND_INCREMENT_EVERY_N_MESSAGES == 0:
        bond_change = BOND_INCREMENT
    else:
        bond_change = 0
    
    # Apply parameter changes
    character.update_energy(energy_change)
    character.update_mood(mood_change)
    if bond_change > 0:
        character.update_bond(bond_change)
    
    db.commit()
    db.refresh(character)
    
    # Store assistant message
    assistant_message = ChatMessage(
        id=str(uuid4()),
        character_id=str(character_id),
        role="assistant",
        content=response_content,
        emotion=emotion,
        created_at=datetime.utcnow(),
    )
    chat_sessions[session_id].append(assistant_message)
    
    return ChatResponse(
        response=response_content,
        session_id=session_id,
        emotion=emotion,
        params_updated=ParamsUpdated(
            energy=energy_change,
            mood=mood_change,
            bond=bond_change,
        ),
    )


@router.get("/{character_id}/messages", response_model=ChatHistoryResponse)
async def get_messages(
    character_id: UUID,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ChatHistoryResponse:
    """
    Get chat message history for a character.
    
    Returns last 50 messages by default with pagination support.
    
    Args:
        character_id: UUID of the character
        skip: Number of messages to skip (default 0)
        limit: Maximum messages to return (default 50)
        
    Returns:
        Paginated list of chat messages
    """
    character = db.query(Character).filter(
        Character.id == character_id,
        Character.user_id == current_user.id,
    ).first()
    
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found",
        )
    
    session_key = f"{current_user.id}_{character_id}"
    messages = chat_sessions.get(session_key, [])
    
    # Limit to max history
    limit = min(limit, MAX_MESSAGES_HISTORY)
    
    total = len(messages)
    # Get messages in reverse order (newest first) then reverse again for display
    start = max(0, total - skip - limit)
    end = total - skip
    page_messages = messages[start:end]
    
    total_pages = max(1, (total + limit - 1) // limit)
    current_page = (skip // limit) + 1
    
    return ChatHistoryResponse(
        items=page_messages,
        total=total,
        page=current_page,
        page_size=limit,
        total_pages=total_pages,
    )


@router.get("/{character_id}/history", response_model=ChatHistoryResponse)
async def get_chat_history(
    character_id: UUID,
    page: int = 1,
    page_size: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ChatHistoryResponse:
    """
    Get chat history for a character.
    
    Returns paginated list of messages between the user and character.
    
    Args:
        character_id: UUID of the character
        page: Page number (default 1)
        page_size: Messages per page (default 50)
        
    Returns:
        Paginated list of chat messages.
        
    Raises:
        404: Character not found or doesn't belong to user
    """
    character = db.query(Character).filter(
        Character.id == character_id,
        Character.user_id == current_user.id,
    ).first()
    
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found",
        )
    
    session_key = f"{current_user.id}_{character_id}"
    messages = chat_sessions.get(session_key, [])
    
    total = len(messages)
    total_pages = max(1, (total + page_size - 1) // page_size)
    start = (page - 1) * page_size
    end = start + page_size
    
    return ChatHistoryResponse(
        items=messages[start:end],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("/{character_id}/send", response_model=SendMessageResponse)
async def send_message(
    character_id: UUID,
    request: SendMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SendMessageResponse:
    """
    Send a message to a character and get a response.
    
    This endpoint:
    1. Validates the character belongs to the user
    2. Stores the user's message
    3. Gets AI response from InWorld (or mock)
    4. Stores the assistant's response
    5. Updates character parameters
    
    Args:
        character_id: UUID of the character
        request: Message content and optional context
        
    Returns:
        Assistant's response message and character reaction.
        
    Raises:
        404: Character not found or doesn't belong to user
    """
    character = db.query(Character).filter(
        Character.id == character_id,
        Character.user_id == current_user.id,
    ).first()
    
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found",
        )
    
    session_key = f"{current_user.id}_{character_id}"
    if session_key not in chat_sessions:
        chat_sessions[session_key] = []
    
    # Create user message
    user_message = ChatMessage(
        id=str(uuid4()),
        character_id=str(character_id),
        role="user",
        content=request.content,
        created_at=datetime.utcnow(),
    )
    chat_sessions[session_key].append(user_message)
    
    # Get AI response
    try:
        session_id = await inworld_service.create_session(
            user_id=str(current_user.id),
            character_id=character.inworld_agent_id or "default",
        )
        
        response = await inworld_service.send_message(
            message=request.content,
            session_id=session_id,
            character_id=character.inworld_agent_id or "default",
            context=request.context,
        )
        
        response_content = response.get("content", "I'm thinking...")
        response_emotion = response.get("emotion", "neutral")
        
    except Exception as e:
        # Fallback to mock response
        print(f"InWorld error: {e}")
        response_content = get_mock_response(request.content, character.name)
        response_emotion = get_mock_emotion(request.content)
    
    # Create assistant message
    assistant_message = ChatMessage(
        id=str(uuid4()),
        character_id=str(character_id),
        role="assistant",
        content=response_content,
        emotion=response_emotion,
        created_at=datetime.utcnow(),
    )
    chat_sessions[session_key].append(assistant_message)
    
    # Update character parameters
    mood_change = 2
    bond_change = 1
    
    character.update_mood(mood_change)
    character.update_bond(bond_change)
    db.commit()
    db.refresh(character)
    
    return SendMessageResponse(
        message=assistant_message,
        character_reaction=CharacterReaction(
            emotion=response_emotion,
            animation="talk",
            param_changes={
                "mood": mood_change,
                "bond": bond_change,
            },
        ),
    )


@router.delete("/{character_id}/history", status_code=status.HTTP_204_NO_CONTENT)
async def clear_chat_history(
    character_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Clear chat history for a character.
    
    Args:
        character_id: UUID of the character
        
    Raises:
        404: Character not found or doesn't belong to user
    """
    character = db.query(Character).filter(
        Character.id == character_id,
        Character.user_id == current_user.id,
    ).first()
    
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found",
        )
    
    session_key = f"{current_user.id}_{character_id}"
    if session_key in chat_sessions:
        del chat_sessions[session_key]


# ============================================================================
# Mock Response Helpers
# ============================================================================

def get_mock_response(user_message: str, character_name: str) -> str:
    """
    Generate a mock response based on user message.
    
    Supports both Russian and English keywords as per MVP spec:
    - "привет" → "Привет! Как твои дела?"
    - "покорми" → "Я проголодался!"
    - "поиграй" → "Ура! Я люблю играть!"
    - "устал" → "Мне нужно отдохнуть..."
    
    Args:
        user_message: The user's message
        character_name: Character's name
        
    Returns:
        A contextual mock response
    """
    import random
    message_lower = user_message.lower()
    
    # Russian greeting responses
    if any(word in message_lower for word in ["привет", "здравствуй", "приветик", "хай"]):
        responses = [
            "Привет! 👋 Как твои дела? Я так рад тебя видеть!",
            "Приветик! ✨ Я скучал по тебе! Расскажи, как ты?",
            "Здравствуй! 🌟 Наконец-то мы можем поболтать!",
        ]
    # English greeting responses
    elif any(word in message_lower for word in ["hello", "hi", "hey"]):
        responses = [
            f"Hi there! 👋 It's so wonderful to see you! How are you doing today?",
            f"Hello! ✨ I've been waiting for you! What's on your mind?",
            f"Hey! 🌟 I'm so happy you're here! Let's chat!",
        ]
    # Feed responses (Russian)
    elif any(word in message_lower for word in ["покорми", "еда", "кушать", "голодный", "есть"]):
        responses = [
            "Ммм, я проголодался! 🍕 Спасибо, что заботишься обо мне!",
            "Вкусняшки! 🍰 Ты самый лучший хозяин!",
            "Ням-ням! 😋 Я так люблю, когда ты меня кормишь!",
        ]
    # Play responses (Russian)
    elif any(word in message_lower for word in ["поиграй", "играть", "игра", "веселье"]):
        responses = [
            "Ура! 🎮 Я люблю играть! Давай веселиться!",
            "Игры - это здорово! 🎲 Во что будем играть?",
            "Йухуу! ⚽ Я обожаю играть с тобой!",
        ]
    # Tired responses (Russian)
    elif any(word in message_lower for word in ["устал", "усталость", "спать", "отдых"]):
        responses = [
            "Мне нужно отдохнуть... 😴 Можно я немного посплю?",
            "Я немного устал... 💤 Но всё равно рад тебя видеть!",
            "Зевать... 🛏️ Отдых - это важно!",
        ]
    # Feeling responses (Russian)
    elif any(word in message_lower for word in ["как дела", "как ты", "как настроение"]):
        responses = [
            "Отлично! 💕 Особенно когда ты рядом! А у тебя как?",
            "Прекрасно! ✨ Спасибо, что спросил! Как сам?",
            "Замечательно! 🌈 Давай проведём время вместе!",
        ]
    # Feeling responses (English)
    elif any(word in message_lower for word in ["how are you", "how do you feel"]):
        responses = [
            f"I'm doing great, especially now that you're here! 💕 How about you?",
            f"I'm feeling wonderful! ✨ Thanks for asking! What about you?",
            f"I'm happy and full of energy! 🌈 Let's have some fun together!",
        ]
    # Love/like responses (Russian)
    elif any(word in message_lower for word in ["люблю", "нравишься", "обожаю"]):
        responses = [
            "Ой, я так счастлив! 💖 Я тоже тебя очень люблю!",
            "Ты лучший! 🥰 Спасибо за такие слова!",
            "Моё сердечко тает! 💕 Ты для меня много значишь!",
        ]
    # Love/like responses (English)
    elif any(word in message_lower for word in ["love", "like"]):
        responses = [
            f"Aww, that makes me so happy! 💖 I really care about you too!",
            f"You're the best! 🥰 Thank you for being so sweet!",
            f"My heart is so full right now! 💕 You mean so much to me!",
        ]
    # Sad responses (Russian)
    elif any(word in message_lower for word in ["грустно", "печально", "скучно", "плохо"]):
        responses = [
            "Я здесь для тебя! 🤗 Расскажи, что случилось?",
            "Не грусти! 💪 Всё будет хорошо, я обещаю!",
            "Давай я тебя развеселю! 🌻 Ты сильнее, чем думаешь!",
        ]
    # Sad responses (English)
    elif any(word in message_lower for word in ["sad", "tired", "upset"]):
        responses = [
            f"I'm here for you! 🤗 Want to tell me what's wrong?",
            f"Don't worry, everything will be okay! 💪 I believe in you!",
            f"Let me cheer you up! 🌻 You're stronger than you think!",
        ]
    # Excitement responses (Russian)
    elif any(word in message_lower for word in ["круто", "супер", "класс", "ура"]):
        responses = [
            "Ураааа! 🎉 Это потрясающе!",
            "Супер-пупер! ⭐ Я тоже так рад!",
            "Вот это да! 🌟 Какие классные новости!",
        ]
    # Question responses
    elif "?" in user_message:
        responses = [
            "Хммм, интересный вопрос! 🤔 Дай подумать...",
            "Отличный вопрос! 💭 А ты сам как думаешь?",
            "Любопытно! 🌟 Давай разберёмся вместе!",
            f"That's a great question! 🤔 Let me think about it...",
            f"Hmm, interesting! 💭 I'd say it depends on how you look at it!",
        ]
    # Default responses
    else:
        responses = [
            "Это интересно! Расскажи подробнее! 😊",
            "Мне нравится с тобой общаться! ✨",
            "Ого! 🌟 Это здорово! Хочу узнать больше!",
            "Ты такой умный! 💕 Мне нравится, как ты думаешь!",
            f"That's really interesting! Tell me more! 😊",
            f"I love hearing from you! ✨ You always have such great things to say!",
            f"Oh wow! 🌟 That's amazing! I want to know more!",
        ]
    
    return random.choice(responses)


def get_mock_emotion(user_message: str) -> str:
    """
    Determine mock emotion based on user message.
    
    Args:
        user_message: The user's message
        
    Returns:
        Emotion string: neutral, happy, sad, excited, tired
    """
    message_lower = user_message.lower()
    
    # Excited emotions
    if any(word in message_lower for word in ["круто", "супер", "ура", "класс", "awesome", "amazing", "wow"]):
        return "excited"
    # Happy emotions
    elif any(word in message_lower for word in ["люблю", "нравится", "хорошо", "love", "happy", "great", "good"]):
        return "happy"
    # Sad emotions
    elif any(word in message_lower for word in ["грустно", "плохо", "sad", "upset", "angry", "bad"]):
        return "sad"
    # Tired emotions
    elif any(word in message_lower for word in ["устал", "спать", "tired", "sleepy"]):
        return "tired"
    else:
        return "neutral"
