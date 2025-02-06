from tortoise import fields
from tortoise.models import Model
from .ProfilesModel import ProfilesModel


class UsersModel(Model):
    """
    User 的資料庫節定義
    """
    id = fields.CharField(max_length=36, unique=True)
    user_uid = fields.CharField(max_length=36, pk=True)
    username = fields.CharField(max_length=30, unique=True)
    email = fields.CharField(max_length=320, unique=True)
    password = fields.CharField(max_length=255)
    verify_num = fields.CharField(max_length=36)
    created_at = fields.CharField(max_length=25)
    updated_at = fields.CharField(max_length=36)


    profiles: fields.ReverseRelation["ProfilesModel"]
    class Meta:
        """
        定義資料庫的名稱 約束
        """
        table = "users"
