// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

type NewTodo struct {
	Todo        string `json:"todo"`
	Description string `json:"description"`
}

type Todo struct {
	ID          string `json:"_id" gorm:"primaryKey;column:_id"`
	Todo        string `json:"todo"`
	Description string `json:"description"`
	Done        bool   `json:"done"`
	CreatedAt   string `json:"createdAt" gorm:"column:createdAt"`
}

type UpdateTodo struct {
	Todo        *string `json:"todo"`
	Description *string `json:"description"`
}