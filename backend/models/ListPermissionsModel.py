from tortoise import fields
from tortoise.models import Model

class ListPermissionsModel(Model):
    """
    閱覽清單的權限
    """
    id = fields.IntField(pk=True)
    f_owner_id = fields.ForeignKeyField(
        "models.UsersModel", 
        related_name="permissions_given",
        on_delete=fields.CASCADE
    )
    f_viewer_id = fields.ForeignKeyField(
        "models.UsersModel", 
        related_name="permissions_received",
        on_delete=fields.CASCADE
    )
    f_list_id = fields.ForeignKeyField(
        "models.ListsModel", 
        related_name="permissions",
        on_delete=fields.CASCADE
    )
    granted_at = fields.CharField(max_length=36)

    class Meta:
        """
        定義資料表名稱
        """
        table = "list_permissions"
        unique_together = ("f_owner_id", "f_viewer_id", "f_list_id")
