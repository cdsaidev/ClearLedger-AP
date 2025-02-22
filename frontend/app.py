# frontend/app.py
import streamlit as st
import requests
import pandas as pd
import plotly.express as px

API_URL = "http://localhost:8000"  # Main app
REVIEW_API_URL = "http://localhost:8001"  # Review app

st.set_page_config(page_title="Brim Invoice Processing", layout="wide")
st.title("Clear Ledger AP")

# Upload Section
st.header("Upload Invoice")
uploaded_file = st.file_uploader("Choose a PDF invoice", type=["pdf"])
if uploaded_file:
    with st.spinner("Processing..."):
        files = {"file": (uploaded_file.name, uploaded_file, "application/pdf")}
        response = requests.post(f"{API_URL}/api/upload_invoice", files=files)
        if response.status_code == 200:
            st.success("Invoice processed successfully!")
            st.json(response.json())  # Optional
        else:
            st.error(f"Error: {response.text}")

# Invoice Table View
st.header("Processed Invoices")
if st.button("Refresh"):
    with st.spinner("Loading invoices..."):
        response = requests.get(f"{API_URL}/api/invoices")
        if response.status_code == 200:
            invoices = response.json()
            if invoices:
                df = pd.DataFrame(invoices)
                display_cols = ["vendor_name", "invoice_number", "total_amount", "confidence"]
                available_cols = [col for col in display_cols if col in df.columns]
                st.dataframe(df[available_cols], use_container_width=True)
            else:
                st.info("No invoices processed yet.")
        else:
            st.error(f"Error: {response.text}")

# Review Panel
st.header("Review Flagged Invoices")
if 'invoices' in locals() and invoices:
    flagged = [inv for inv in invoices if float(inv.get("confidence", 1.0)) < 0.9]
    for inv in flagged:
        with st.expander(f"Invoice {inv.get('invoice_number', 'Unknown')}"):
            vendor = st.text_input("Vendor", inv.get("vendor_name", ""), key=f"vendor_{inv['invoice_number']}")
            total = st.number_input("Total", float(inv.get("total_amount", 0)), key=f"total_{inv['invoice_number']}")
            if st.button("Save Changes", key=f"save_{inv['invoice_number']}"):
                review_data = {
                    "invoice_id": inv["invoice_number"],
                    "corrections": {"vendor_name": vendor, "total_amount": str(total)},
                    "reviewer_notes": "Manual correction via UI"
                }
                response = requests.post(f"{REVIEW_API_URL}/review", json=review_data)
                if response.status_code == 200:
                    st.success("Corrections submitted!")
                else:
                    st.error(f"Error submitting corrections: {response.text}")

# Performance Metrics Section
st.header("📊 Performance Metrics")

# Only proceed if we have invoice data
if 'invoices' in locals() and invoices:
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Processing Times")
        # Extract processing times from invoices
        times_df = pd.DataFrame([{
            'Invoice': inv.get('invoice_number', 'Unknown'),
            'Extraction (s)': inv.get('extraction_time', 0),
            'Validation (s)': inv.get('validation_time', 0),
            'Total (s)': inv.get('total_processing_time', 0)
        } for inv in invoices])
        
        st.table(times_df.style.format({
            'Extraction (s)': '{:.2f}',
            'Validation (s)': '{:.2f}',
            'Total (s)': '{:.2f}'
        }))
        
        # Average metrics
        st.metric(
            "Avg. Processing Time", 
            f"{times_df['Total (s)'].mean():.2f}s"
        )
    
    with col2:
        st.subheader("Confidence Score Distribution")
        # Create confidence score distribution
        confidence_df = pd.DataFrame([{
            'Invoice': inv.get('invoice_number', 'Unknown'),
            'Confidence': float(inv.get('confidence', 0)) * 100
        } for inv in invoices])
        
        # Create bar chart using plotly
        fig = px.bar(
            confidence_df,
            x='Invoice',
            y='Confidence',
            title='Confidence Scores by Invoice',
            labels={'Confidence': 'Confidence Score (%)'}
        )
        fig.update_layout(xaxis_tickangle=-45)
        st.plotly_chart(fig, use_container_width=True)
        
        # Confidence statistics
        st.metric(
            "Avg. Confidence Score",
            f"{confidence_df['Confidence'].mean():.1f}%"
        )
else:
    st.info("Process some invoices to see performance metrics.")