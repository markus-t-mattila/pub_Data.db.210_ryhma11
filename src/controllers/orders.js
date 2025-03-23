import pool from '../config/db.js';

export const getOrders = async (req, res) => {
    const client = await pool.connect();
  
    try {
      // sallitut hakuehdot
      const allowedFilters = {
        before: { column: 'p.date', operator: '<=', wrapLike: false },
        after: { column: 'p.date', operator: '>=', wrapLike: false },
        store_id: { column: 's.id', operator: '=', wrapLike: false },
        store_name: { column: 's.name', operator: 'ILIKE', wrapLike: true },
        customer_id: { column: 'c.id', operator: '=', wrapLike: false },
        customer_name: { column: 'c.name', operator: 'ILIKE', wrapLike: true },
        customer_email: { column: 'c.email', operator: 'ILIKE', wrapLike: true },
        shipping_id: { column: 'sh.shipping_id', operator: '=', wrapLike: false },
        tracking_number: { column: 'sh.tracking_number', operator: 'ILIKE', wrapLike: true }
      };
  
      const conditions = [];
      const values = [];
      let i = 1;
  
      // WHERE-ehdot dynaamisesti
      for (const [param, config] of Object.entries(allowedFilters)) {
        const value = req.query[param];
        if (value !== undefined) {
          const paramValue = config.wrapLike ? `%${value}%` : value;
          conditions.push(`${config.column} ${config.operator} $${i++}`);
          values.push(paramValue);
        }
      }
  
      const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  
      // Suorita SQL
      const query = `
        SELECT
          p.id AS purchase_id,
          p.date,
          p.total_price,
          p.shipping_price,
          c.id AS customer_id,
          c.name AS customer_name,
          c.email AS customer_email,
          c.phone,
          c.street_address AS customer_address,
          c.postcode AS customer_postcode,
          c.city AS customer_city,
          s.id AS store_id,
          s.name AS store_name,
          s.street_address AS store_address,
          s.city AS store_city,
          s.email AS store_email,
          s.phone_num AS store_phone,
          sh.id AS shipment_id,
          sh.shipping_id,
          sp.price AS package_price,
          sh.tracking_number,
          b.id AS book_id,
          b.condition,
          t.name AS title_name,
          t.publisher,
          t.isbn,
          t.year
        FROM purchase p
        JOIN customer c ON p.customer_id = c.id
        JOIN book b ON b.purchase_id = p.id
        JOIN title t ON b.title_id = t.id
        JOIN store s ON b.store_id = s.id
        JOIN shipment_item si ON si.book_id = b.id
        JOIN shipment sh ON sh.id = si.shipment_id
        JOIN shipping sp ON sp.max_weight = sh.shipping_id
        ${whereClause}
        ORDER BY p.date DESC, sh.id, b.id
      `;
  
      const result = await client.query(query, values);
  
      // tulos JSON-muotoon
      const grouped = {};
  
      for (const row of result.rows) {
        const purchaseId = row.purchase_id;
  
        if (!grouped[purchaseId]) {
          grouped[purchaseId] = {
            purchase_id: purchaseId,
            date: row.date,
            total_price: row.total_price,
            shipping_price: row.shipping_price,
            customer: {
              id: row.customer_id,
              name: row.customer_name,
              email: row.customer_email,
              phone: row.phone,
              street_address: row.customer_address,
              postcode: row.customer_postcode,
              city: row.customer_city
            },
            store: {
              id: row.store_id,
              name: row.store_name,
              address: row.store_address,
              city: row.store_city,
              email: row.store_email,
              phone: row.store_phone
            },
            shipments: []
          };
        }
  
        const shipmentList = grouped[purchaseId].shipments;
        let shipment = shipmentList.find(s => s.shipment_id === row.shipment_id);
  
        if (!shipment) {
          shipment = {
            shipment_id: row.shipment_id,
            shipping_id: row.shipping_id,
            package_price: row.package_price,
            tracking_number: row.tracking_number,
            books: []
          };
          shipmentList.push(shipment);
        }
  
        shipment.books.push({
          book_id: row.book_id,
          condition: row.condition,
          title: {
            name: row.title_name,
            publisher: row.publisher,
            isbn: row.isbn,
            year: row.year
          }
        });
      }
  
      const response = Object.values(grouped);
      res.json(response);
  
    } catch (error) {
      console.error("Virhe tilausten hakemisessa:", error.message);
      res.status(500).json({ error: "Palvelinvirhe: " + error.message });
    } finally {
      client.release();
    }
  };
  