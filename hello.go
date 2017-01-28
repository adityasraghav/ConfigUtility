package main

import (
"net/http"
"github.com/gin-gonic/gin"
"encoding/csv"
"log"
"strings"

"encoding/json"


)
type Body struct {
	RawData     string `form:"data" json:"data" binding:"required"`
	Delimitter string `form:"delimitter" json:"delimitter" binding:"required"`
}


func myparse(csvFile string, de string) [][]string {

	a := strings.NewReader(csvFile)
	r := csv.NewReader(a)
	r.Comma = rune(de[0])
	r.LazyQuotes =  true
	lines, err := r.ReadAll()
	if err != nil {
		log.Fatalf("error reading all lines: %v", err)
		return nil
	}
	return lines
}

func main() {

	gin.SetMode(gin.ReleaseMode)

	router := gin.Default()

	router.OPTIONS("/parse", func (c *gin.Context){
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "access-control-allow-origin, access-control-allow-headers, Content-Type")
		c.String(http.StatusOK, string("ok"))
	})
	router.POST("/parse", func(c *gin.Context) {

		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")

		var rawData, delimitter string

		var jsn Body
		if c.BindJSON(&jsn) == nil {

			rawData = jsn.RawData
			delimitter = jsn.Delimitter
		} else
		{
			c.String(http.StatusInternalServerError, "Error in parse Request")
		}
		var abc = myparse(rawData, delimitter)


		if abc != nil{
			b, err := json.Marshal(abc)

			if err != nil {
				log.Fatalf("error reading all lines: %v", err)


			}else{
				c.String(http.StatusOK, string(b))
			}


		}else
		{
			c.String(http.StatusInternalServerError, "parse error")
		}

})
	router.Run(":8080")
}



