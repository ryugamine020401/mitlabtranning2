"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { FileUpload } from "../components/FileUpload";
import {
  Plus,
  Check,
  X,
  Trash2,
  Edit2,
  Home,
  FileText,
  Users,
  Camera,
} from "lucide-react";
import { ProductsBox } from "../../../../services/ProductsManager/ProductsBox";
import { ShareButton } from "./components/ShareButton";
//import { useReactToPrint } from "react-to-print"; //PDF
import { BarcodeScanner } from "./components/BarcodeScanner";
import { Story } from "./components/Story";

export default function ListProduct() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [errors, setErrors] = useState({});
  const [newProduct, setNewProduct] = useState({
    id: "",
    product_name: "",
    product_barcode: "",
    product_number: "1",
    product_image_url: "",
    expire_date: "",
    description: "",
    checked: false,
  });
  const [errorMessage, setErrorMessage] = useState(""); // 儲存錯誤訊息
  const [successMessage, setSuccessMessage] = useState(""); // 儲存成功訊息
  const [refreshKey, setRefreshKey] = useState(0); // 用來觸發 `useEffect`
  const [listid, setListid] = useState(null);
  const [listname, setListName] = useState("");
  const [showScanner, setShowScanner] = useState("");
  const [oldestProduct, setOldestProduct] = useState(null);
  const hasFetched = useRef(false); // 記錄 API 是否已被調用

  useEffect(() => {
    const currentPath = window.location.pathname; // 取得路由 path
    const pathSegments = currentPath.split("/"); // 分割 path
    const Name = pathSegments[pathSegments.length - 1] || ""; // 取得最後一個 path segment

    const urlParams = new URLSearchParams(window.location.search); // 解析 Query String
    const id = urlParams.get("id") || ""; // 獲取 id
    if (id) setListid(id);
    if (Name) setListName(Name);
    setErrorMessage("");
    setSuccessMessage("");

    ProductsBox("/get_product/", { f_list_id: id }, true)
      .then((response) => {
        if (response.data.length > 0) {
          const formattedProduct = response.data.map((item) => ({
            id: item.id,
            product_name: item.product_name,
            product_barcode: item.product_barcode,
            product_number: item.product_number,
            product_image_url: item.product_image_url,
            expire_date: item.expiry_date,
            description: item.description || "",
            checked: false,
          }));

          setProducts(formattedProduct);

          if (hasFetched.current) return; // 若已調用過 API，則直接返回
          hasFetched.current = true; // 標記 API 已調用
          // 找到最舊的 expire_date 產品
          const oldest = formattedProduct.reduce((oldest, current) =>
            new Date(current.expire_date) < new Date(oldest.expire_date)
              ? current
              : oldest
          );
          setOldestProduct(oldest);
        } else {
          setProducts([]);
          setErrorMessage(response.msg);
        }
      })
      .catch((error) => {
        setErrorMessage(error.message); // 顯示API回傳的錯誤訊息
      });
  }, [refreshKey]);

  const handleCheck = (id) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, checked: !product.checked } : product
      )
    );
    setTimeout(() => {
      handleDelete(id);
    }, 800);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditingProduct({ ...product });
  };

  const handleEditChange = (field, value) => {
    setEditingProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleQuantityInput = (value, isEditing = false) => {
    const numberValue = Math.max(1, Number.parseInt(value) || 1);
    if (isEditing) {
      setEditingProduct((prev) => ({
        ...prev,
        product_number: numberValue.toString(),
      }));
    } else {
      setNewProduct((prev) => ({
        ...prev,
        product_number: numberValue.toString(),
      }));
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingProduct(null);
  };

  const handleConfirmEdit = () => {
    ProductsBox(
      "/update_product/",
      {
        f_list_id: listid,
        id: editingProduct.id.toString(),
        product_name: editingProduct.product_name,
        product_barcode: editingProduct.product_barcode,
        product_image_url: "",
        product_number: editingProduct.product_number,
        expiry_date: editingProduct.expire_date,
        description: editingProduct.description,
      },
      true
    )
      .then((result) => {
        console.log("update_product successful!");
        setSuccessMessage("更新成功");
        setEditingId(null);
        setEditingProduct(null);
        setTimeout(() => {
          setSuccessMessage("");
          setRefreshKey((prevKey) => prevKey + 1);
        }, 1500);
      })
      .catch((error) => {
        setErrorMessage(error.message); // 顯示API回傳的錯誤訊息
        console.log("update_product failed:", error.message);
      });
  };

  const handleDelete = (id) => {
    ProductsBox(
      "/delete_product/",
      {
        f_list_id: listid,
        id: id.toString(),
      },
      true
    )
      .then((result) => {
        console.log("Delet_product successful!");
        setSuccessMessage("更新成功");
        setEditingId(null);
        setTimeout(() => {
          setSuccessMessage("");
          setRefreshKey((prevKey) => prevKey + 1);
        }, 1500);
      })
      .catch((error) => {
        setErrorMessage(error.message); // 顯示API回傳的錯誤訊息
        console.log("Delet_product failed:", error.message);
      });
  };

  const handleAddNew = () => {
    setErrorMessage("");
    setIsAddingNew(true);
  };

  const handleCancelAdd = () => {
    setIsAddingNew(false);
    setNewProduct({
      id: "",
      product_name: "",
      product_barcode: "",
      product_number: "1",
      product_image_url: "",
      expire_date: "",
      description: "",
      checked: false,
    });
  };

  const handleConfirmAdd = () => {
    if (validateForm(newProduct)) {
      ProductsBox(
        "/create_product/",
        {
          f_list_id: listid,
          product_name: newProduct.product_name,
          product_barcode: newProduct.product_barcode,
          product_image_url: newProduct.product_image_url,
          product_number: newProduct.product_number,
          expiry_date: newProduct.expire_date,
          description: newProduct.description,
        },
        true
      )
        .then((response) => {
          setSuccessMessage("新增成功！");

          setTimeout(() => {
            setSuccessMessage("");
            setRefreshKey((prevKey) => prevKey + 1);
          }, 1000);

          handleCancelAdd();
        })
        .catch((error) => {
          setErrorMessage(error.message);
        });
    }
  };

  const handlePrint = () => {
    window.print();
  };
  const validateForm = (data) => {
    const newErrors = {};
    if (!data.product_name.trim()) newErrors.product_name = "商品名稱不能為空";
    if (!data.expire_date.trim()) newErrors.expire_date = "到期日期不能為空";
    if (!data.product_barcode.trim())
      newErrors.product_barcode = "條碼不能為空";
    if (!data.product_number.trim()) newErrors.product_number = "數量不能為空";
    if (!data.product_image_url.trim())
      newErrors.product_image_url = "圖片URL不能為空";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/home`}>
              <Button variant="secondary print-btn">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{listname}</h1>
          </div>
          <div className="flex items-center gap-4">
            <ShareButton />
            <Button onClick={() => handlePrint()} variant="secondary">
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/*商品表格*/}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">清單名稱</h2>
            {/* API錯誤訊息顯示 */}
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="w-10 px-6 py-3 bg-gray-50"></th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      圖片
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      商品名稱
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      到期日期
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      條碼
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      數量
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      描述
                    </th>
                    <th className="w-20 px-6 py-3 bg-gray-50"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleCheck(product.id)}
                          className={`w-5 h-5 border rounded ${
                            product.checked
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300 hover:border-blue-500"
                          }`}
                        >
                          {product.checked && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === product.id ? (
                          <FileUpload
                            onFileSelect={(base64) => {
                              setEditingProduct((prev) => ({
                                ...prev,
                                product_image_url: base64, // 存儲 Base64 字串
                              }));
                            }}
                            errors={errors.product_image_url}
                          />
                        ) : (
                          <img
                            src={
                              product.product_image_url
                                ? `${process.env.NEXT_PUBLIC_API_URL}/${product.product_image_url}`
                                : "/file.svg"
                            }
                            alt={product.product_name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === product.id ? (
                          <Input
                            value={editingProduct.product_name}
                            onChange={(e) =>
                              handleEditChange("product_name", e.target.value)
                            }
                            error={errors.name}
                          />
                        ) : (
                          product.product_name
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === product.id ? (
                          <Input
                            type="date"
                            value={editingProduct.expire_date}
                            onChange={(e) =>
                              handleEditChange("expire_date", e.target.value)
                            }
                            error={errors.expire_date}
                          />
                        ) : (
                          product.expire_date
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === product.id ? (
                          <div className="flex items-center gap-2 relative">
                            <Input
                              value={editingProduct.product_barcode}
                              onChange={(e) =>
                                handleEditChange(
                                  "product_barcode",
                                  e.target.value
                                )
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowScanner(product.id)}
                              className="flex-shrink-0"
                            >
                              <Camera className="h-4 w-4" />
                            </Button>
                            {showScanner === product.id && (
                              <div className="absolute top-full left-0 mt-2">
                                <BarcodeScanner
                                  onScan={(code) => {
                                    handleEditChange("product_barcode", code);
                                    setShowScanner(null);
                                  }}
                                  onClose={() => setShowScanner(null)}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          product.product_barcode
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === product.id ? (
                          <Input
                            type="number"
                            min="1"
                            value={editingProduct.product_number}
                            onChange={(e) =>
                              handleQuantityInput(e.target.value, true)
                            }
                            className="w-20 text-center"
                          />
                        ) : (
                          product.product_number
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === product.id ? (
                          <Input
                            value={editingProduct.description}
                            onChange={(e) =>
                              handleEditChange("description", e.target.value)
                            }
                          />
                        ) : (
                          product.description
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === product.id ? (
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              onClick={() => handleDelete(product.id)}
                              className="p-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button onClick={handleConfirmEdit} className="p-2">
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={handleCancelEdit}
                              className="p-2"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="secondary"
                            onClick={() => handleEdit(product)}
                            className="p-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {isAddingNew && (
                    <tr>
                      <td className="px-6 py-4">
                        <button className="w-5 h-5 border rounded border-gray-300" />
                      </td>
                      <td className="px-6 py-4">
                        <FileUpload
                          onFileSelect={(base64) => {
                            setNewProduct((prev) => ({
                              ...prev,
                              product_image_url: base64, // 存儲 Base64 字串
                            }));
                          }}
                          errors={errors.product_image_url}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          value={newProduct.product_name}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              product_name: e.target.value,
                            })
                          }
                          placeholder="商品名稱"
                          error={errors.product_name}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          type="date"
                          value={newProduct.expire_date}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              expire_date: e.target.value,
                            })
                          }
                          error={errors.expire_date}
                        />
                      </td>
                      <td className="px-6 py-4">
                        {/* <Input
                          value={newProduct.product_barcode}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              product_barcode: e.target.value,
                            })
                          }
                          placeholder="條碼"
                          error={errors.product_barcode}
                        ></Input> */}
                        <div className="flex items-center gap-2 relative">
                          <Input
                            value={newProduct.product_barcode}
                            onChange={(e) =>
                              setNewProduct({
                                ...newProduct,
                                product_barcode: e.target.value,
                              })
                            }
                            placeholder="條碼"
                            error={errors.product_barcode}
                          />

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowScanner(true)}
                            className="flex-shrink-0"
                          >
                            <Camera className="h-4 w-4" />
                          </Button>
                          {showScanner && (
                            <div className="absolute top-full left-0 mt-2">
                              <BarcodeScanner
                                onScan={(code) => {
                                  setNewProduct({
                                    ...newProduct,
                                    product_barcode: code,
                                  })
                                  
                                  setShowScanner(null);
                                }}
                                onClose={() => setShowScanner(null)}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          type="number"
                          min="1"
                          value={newProduct.product_number}
                          onChange={(e) => handleQuantityInput(e.target.value)}
                          className="w-20 text-center"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          value={newProduct.description}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              description: e.target.value,
                            })
                          }
                          placeholder="描述"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button onClick={handleConfirmAdd} className="p-2">
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={handleCancelAdd}
                            className="p-2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* 成功訊息顯示 */}
            {successMessage && (
              <p className="text-green-500">{successMessage}</p>
            )}
            {!isAddingNew && (
              <div className="mt-4">
                <Button onClick={handleAddNew} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  新增商品
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div>
        {oldestProduct && (
          <div>
            <Story
              product={oldestProduct}
              onClose={() => setOldestProduct(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
