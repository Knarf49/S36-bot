from typing import Text, List, Any, Dict
from rasa.engine.recipes.default_recipe import DefaultV1Recipe
from rasa.nlu.tokenizers.tokenizer import Token, Tokenizer
from rasa.shared.nlu.training_data.message import Message
from pythainlp.tokenize import word_tokenize


@DefaultV1Recipe.register(
    DefaultV1Recipe.ComponentType.MESSAGE_TOKENIZER, is_trainable=False
)
class ThaiTokenizer(Tokenizer):
    @staticmethod
    def get_default_config() -> Dict[Text, Any]:
        return {
            "intent_tokenization_flag": False,
            "intent_split_symbol": "_",
            "token_pattern": None,
            "prefix_separator_symbol": None,
        }

    def tokenize(self, message: Message, attribute: Text) -> List[Token]:
        text = message.get(attribute)
        if not text:
            return []
        tokens = word_tokenize(text, engine="newmm", keep_whitespace=False)
        result = []
        offset = 0
        for t in tokens:
            word = t.strip()
            if not word:
                continue
            start = text.find(word, offset)
            if start == -1:
                start = offset
            end = start + len(word)
            result.append(Token(word, start, end))
            offset = end
        return result
