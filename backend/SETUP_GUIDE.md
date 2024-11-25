# 📃 SETUP GUIDE FOR BACKEND

## ❗ System Requirements

- [Git](https://git-scm.com/downloads): Version control system.

- [Node.js](https://nodejs.org/en/): JavaScript runtime built on Chrome's V8 JavaScript engine (Please go with any latest LTS versions)
- 

## 📝 Additional Requirements

- [Supabase](https://firebase.google.com/): The project uses supabase as a postgres database provider for the users. I recommend you to use the provided credentials below for Supabase configuration. Else i will also mention how to setup the complete database with postgres functions


## 🛠 Local Installation and Setup


1. If you are in the root folder get into the backend folder using
   ```bash
   cd backend
   ```
2. Install the required dependency for server using :

   ```javascript
   npm install
   ```

3. Create a `.env` file and copy-paste the contents of `.env.sample` in it.

4. Start the backend server using :

   ```javascript
   npm run dev
   ```

### 🚀 If Running the Backend Using Docker

Follow these simple steps to build and run your backend using Docker:

---

### Step 1: Build the Docker Image

Run the following command to create a Docker image for your backend application:

```bash
docker build -t backend-app .
   ```

   ```bash
   docker run --env-file .env -p 8000:8000 backend-app
   ```

## The application will run using the sample env credentials if you want to setup supabase then steps are below

## 🛠 Supabase Setup

1. Navigate to the [Supabase](https://supabase.com/) dashboard and log in to your account.

2. Select your project or create a new project if not already done.

3. Open the **SQL Editor** in the Supabase dashboard.

4. Run the following SQL queries sequentially to set up your database schema:

    ```sql
    -- Create the Users table
    CREATE TABLE public.users (
        id UUID NOT NULL,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        role INTEGER NULL,
        CONSTRAINT users_pkey PRIMARY KEY (id),
        CONSTRAINT users_email_key UNIQUE (email),
        CONSTRAINT users_role_check CHECK (
            (
                (role >= 1)
                AND (role <= 5)
            )
        )
    ) TABLESPACE pg_default;

    -- Create the Transactions table
    CREATE TABLE public.transactions (
        transactionid UUID NOT NULL,
        type CHARACTER VARYING(255) NOT NULL,
        transaction_timestamp BIGINT NOT NULL,
        originuserid CHARACTER VARYING(255) NOT NULL,
        destinationuserid CHARACTER VARYING(255) NOT NULL,
        originamountdetails JSONB NOT NULL,
        destinationamountdetails JSONB NOT NULL,
        promotioncodeused BOOLEAN NOT NULL,
        reference TEXT NULL,
        origindevicedata JSONB NOT NULL,
        destinationdevicedata JSONB NOT NULL,
        tags JSONB NOT NULL,
        description TEXT NULL,
        originemail CHARACTER VARYING(255) NULL,
        destinationemail CHARACTER VARYING(255) NULL,
        CONSTRAINT transactions_pkey PRIMARY KEY (transactionid)
    ) TABLESPACE pg_default;
    ```

5. Verify that all tables have been created successfully by navigating to the **Table Editor** in the Supabase dashboard.

6. Now lets create the psql functions  by running the queries in the sql editor

7. 
   ```sql
    CREATE OR REPLACE FUNCTION search_transactions_by_varchar(
        p_user_id VARCHAR DEFAULT NULL,
        p_type VARCHAR DEFAULT NULL,
        p_start_timestamp BIGINT DEFAULT NULL,
        p_end_timestamp BIGINT DEFAULT NULL,
        p_min_amount NUMERIC DEFAULT NULL,
        p_max_amount NUMERIC DEFAULT NULL,
        p_currency VARCHAR DEFAULT NULL,
        p_description TEXT DEFAULT NULL,
        p_page INT DEFAULT 1,
        p_page_size INT DEFAULT 10
    ) RETURNS TABLE (
        transactionid uuid,
        type VARCHAR,
        transaction_timestamp BIGINT,
        originuserid VARCHAR,
        destinationuserid VARCHAR,
        originamountdetails JSONB,
        destinationamountdetails JSONB,
        promotioncodeused BOOLEAN,
        reference TEXT,
        origindevicedata JSONB,
        destinationdevicedata JSONB,
        tags JSONB,
        description TEXT,
        originemail VARCHAR,
        destinationemail VARCHAR
    ) AS $$
    BEGIN
        RETURN QUERY
        SELECT 
            t.transactionid,
            t.type,
            t.transaction_timestamp,
            t.originuserid,
            t.destinationuserid,
            t.originamountdetails,
            t.destinationamountdetails,
            t.promotioncodeused,
            t.reference,
            t.origindevicedata,
            t.destinationdevicedata,
            t.tags,
            t.description,
            t.originemail,
            t.destinationemail
        FROM transactions t
        WHERE 
            (p_user_id IS NULL OR t.originuserid = p_user_id OR t.destinationuserid = p_user_id)
            AND (p_type IS NULL OR t.type = p_type)
            AND (p_start_timestamp IS NULL OR t.transaction_timestamp >= p_start_timestamp)
            AND (p_end_timestamp IS NULL OR t.transaction_timestamp <= p_end_timestamp)
            AND (p_min_amount IS NULL OR (t.originamountdetails->>'transactionAmount')::NUMERIC >= p_min_amount)
            AND (p_max_amount IS NULL OR (t.originamountdetails->>'transactionAmount')::NUMERIC <= p_max_amount)
            AND (p_currency IS NULL OR (t.originamountdetails->>'transactionCurrency') = p_currency)
            AND (p_description IS NULL OR t.description ILIKE '%' || p_description || '%')
        ORDER BY t.transaction_timestamp DESC
        OFFSET (p_page - 1) * p_page_size
        LIMIT p_page_size;
    END;
    $$ LANGUAGE plpgsql;
    ```
    ```sql
    CREATE OR REPLACE FUNCTION search_transactions(
        p_user_id UUID DEFAULT NULL,
        p_type VARCHAR DEFAULT NULL,
        p_start_timestamp BIGINT DEFAULT NULL,
        p_end_timestamp BIGINT DEFAULT NULL,
        p_min_amount NUMERIC DEFAULT NULL,
        p_max_amount NUMERIC DEFAULT NULL,
        p_currency VARCHAR DEFAULT NULL,
        p_description TEXT DEFAULT NULL,
        p_page INT DEFAULT 1,
        p_page_size INT DEFAULT 10
    ) RETURNS TABLE (
        transactionid UUID,
        type VARCHAR,
        transaction_timestamp BIGINT,
        originuserid UUID,
        destinationuserid UUID,
        originamountdetails JSONB,
        destinationamountdetails JSONB,
        promotioncodeused BOOLEAN,
        reference TEXT,
        origindevicedata JSONB,
        destinationdevicedata JSONB,
        tags JSONB,
        description TEXT,
        originemail VARCHAR,
        destinationemail VARCHAR
    ) AS $$
    BEGIN
        RETURN QUERY
        SELECT 
            t.transactionid,
            t.type,
            t.transaction_timestamp,
            t.originuserid,
            t.destinationuserid,
            t.originamountdetails,
            t.destinationamountdetails,
            t.promotioncodeused,
            t.reference,
            t.origindevicedata,
            t.destinationdevicedata,
            t.tags,
            t.description,
            t.originemail,
            t.destinationemail
        FROM transactions t
        WHERE 
            (p_user_id IS NULL OR t.originuserid = p_user_id OR t.destinationuserid = p_user_id)
            AND (p_type IS NULL OR t.type = p_type)
            AND (p_start_timestamp IS NULL OR t.transaction_timestamp >= p_start_timestamp)
            AND (p_end_timestamp IS NULL OR t.transaction_timestamp <= p_end_timestamp)
            AND (p_min_amount IS NULL OR (t.originamountdetails->>'transactionAmount')::NUMERIC >= p_min_amount)
            AND (p_max_amount IS NULL OR (t.originamountdetails->>'transactionAmount')::NUMERIC <= p_max_amount)
            AND (p_currency IS NULL OR (t.originamountdetails->>'transactionCurrency') = p_currency)
            AND (p_description IS NULL OR t.description ILIKE '%' || p_description || '%')
        ORDER BY t.transaction_timestamp DESC
        OFFSET (p_page - 1) * p_page_size
        LIMIT p_page_size;
    END;
    $$ LANGUAGE plpgsql;
    ```
    ```sql
    CREATE OR REPLACE FUNCTION get_transaction(p_transactionid UUID)
    RETURNS TABLE (
        transactionId UUID,
        type VARCHAR,
        timestamp INT8,
        originUserId VARCHAR,
        destinationUserId VARCHAR,
        originAmountDetails JSONB,
        destinationAmountDetails JSONB,
        promotionCodeUsed BOOLEAN,
        reference TEXT,
        originDeviceData JSONB,
        destinationDeviceData JSONB,
        tags JSONB,
        description TEXT,
        originEmail VARCHAR,
        destinationEmail VARCHAR
    ) AS $$
    BEGIN
        RETURN QUERY
        SELECT
            transactionId,
            type,
            timestamp,
            originUserId,
            destinationUserId,
            originAmountDetails,
            destinationAmountDetails,
            promotionCodeUsed,
            reference,
            originDeviceData,
            destinationDeviceData,
            tags,
            description,
            originEmail,
            destinationEmail
        FROM transactions
        WHERE transactionId = p_transactionid;
    END;
    $$ LANGUAGE plpgsql;
    ```
     ```sql
    CREATE OR REPLACE FUNCTION insert_transaction(
        p_transactionId uuid_generate_v4,
        p_type VARCHAR,
        p_timestamp BIGINT,
        p_originUserId VARCHAR,
        p_destinationUserId VARCHAR,
        p_originAmountDetails JSONB,
        p_destinationAmountDetails JSONB,
        p_promotionCodeUsed BOOLEAN,
        p_reference TEXT,
        p_originDeviceData JSONB,
        p_destinationDeviceData JSONB,
        p_tags JSONB,
        p_description TEXT,
        p_originEmail VARCHAR,
        p_destinationEmail VARCHAR
    )
    RETURNS VOID AS $$
    BEGIN
        INSERT INTO transactions (
            transactionId,
            type,
            timestamp,
            originUserId,
            destinationUserId,
            originAmountDetails,
            destinationAmountDetails,
            promotionCodeUsed,
            reference,
            originDeviceData,
            destinationDeviceData,
            tags,
            description,
            originEmail,
            destinationEmail
        ) VALUES (
            p_transactionId,
            p_type,
            p_timestamp,
            p_originUserId,
            p_destinationUserId,
            p_originAmountDetails,
            p_destinationAmountDetails,
            p_promotionCodeUsed,
            p_reference,
            p_originDeviceData,
            p_destinationDeviceData,
            p_tags,
            p_description,
            p_originEmail,
            p_destinationEmail
        );
    END;
    $$ LANGUAGE plpgsql;
    ```
     ```sql
    CREATE OR REPLACE FUNCTION get_user_by_id(
        _user_id UUID
    )
    RETURNS TABLE (
        user_id UUID,
        user_name TEXT,
        user_email TEXT,
        user_password TEXT,
        user_role INTEGER
    ) AS $$
    BEGIN
        RETURN QUERY 
        SELECT 
            id, 
            name, 
            email, 
            password, 
            role
        FROM users
        WHERE id = _user_id;
    END;
    $$ LANGUAGE plpgsql;
    ```
     ```sql
    CREATE OR REPLACE FUNCTION insert_user(
      _id UUID,
      _name TEXT, 
      _email TEXT, 
      _password TEXT, 
      _role INTEGER
    )
    RETURNS UUID AS $$
    DECLARE
      existing_user UUID;
    BEGIN
      -- Check if user already exists
      SELECT id INTO existing_user 
      FROM users 
      WHERE email = _email;

      -- If user doesn't exist, insert
      IF existing_user IS NULL THEN
        INSERT INTO users (id, name, email, password, role)
        VALUES (_id, _name, _email, _password, _role);
        
        RETURN _id;
      ELSE
        -- Optionally, you can raise an error or return an existing user ID
        RAISE EXCEPTION 'User with email % already exists', _email;
      END IF;
    END;
    $$ LANGUAGE plpgsql;
    ```
     ```sql
    CREATE OR REPLACE FUNCTION get_user_by_email(input_email TEXT)
    RETURNS TABLE (
        user_id UUID, 
        user_name TEXT,
        user_email TEXT, 
        user_password TEXT,
        user_role INTEGER
    ) AS $$
    BEGIN
        RETURN QUERY 
        SELECT 
            id, 
            username,  -- Assuming you have a username column
            email, 
            password,  
            role
        FROM users
        WHERE email = input_email;
    END;
    $$ LANGUAGE plpgsql;
    ```
   
   
8. Update your `.env` file in the backend to include the Supabase project URL and API key:

    ```env
    SUPABASE_URL=your-supabase-url
    SUPABASE_ANON_KEY=your-supabase-key
    ```

9. Ensure your backend server has the required configurations to interact with the Supabase instance.
10. Test the connection to confirm everything is working correctly.
   