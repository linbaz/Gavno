from fastapi.testclient import TestClient
from app import app
from config13123 import ROOM_ID, FILTERS

client = TestClient(app)

def test_apply_valid_filter():
    """Перевірка застосування правильного фільтра"""
    payload = {
        "image_data": [255] * 100,  # Імітація даних пікселів (біле зображення)
        "width": 10,
        "height": 10,
        "filter_name": FILTERS[0]  # Використовуємо перший фільтр
    }
    res = client.post(f"/filter/{ROOM_ID}", json=payload)
    assert res.status_code == 200, "Статус відповіді повинен бути 200"
    json_res = res.json()
    assert "image_data" in json_res, "Відповідь повинна містити відфільтроване зображення"
    assert len(json_res["image_data"]) == len(payload["image_data"]), \
        "Довжина відфільтрованих даних повинна збігатися з вхідними"

def test_apply_invalid_filter():
    """Перевірка застосування недійсного фільтру"""
    payload = {
        "image_data": [255] * 100,
        "width": 10,
        "height": 10,
        "filter_name": "non-existent-filter"  # Несуществующий фільтр
    }
    res = client.post(f"/filter/{ROOM_ID}", json=payload)
    assert res.status_code == 422, "Статус відповіді повинен бути 422 при недійсному фільтрі"

def test_filter_invalid_room():
    """Перевірка обробки неправильного ID кімнати"""
    payload = {
        "image_data": [255] * 100,
        "width": 10,
        "height": 10,
        "filter_name": FILTERS[0]
    }
    res = client.post(f"/filter/invalid_room", json=payload)
    assert res.status_code == 404, "Статус відповіді повинен бути 404 для неправильного ID кімнати"